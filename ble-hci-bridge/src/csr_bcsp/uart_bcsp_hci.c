// Copyright 2015 Playground Global LLC

/*
 *
 *  BlueZ - Bluetooth protocol stack for Linux
 *
 *  Copyright (C) 2004-2007  Marcel Holtmann <marcel@holtmann.org>
 *
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 */

#include <ble/csr_bcsp/uart_bcsp_hci.h>
#include <ble/log.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <ble/csr_bcsp/csr.h>
#include <ble/hci.h>
#include <ble/internal.h>
#include <ble/hci_bridge.h>
#include <termios.h>
#include <pthread.h>

int cmd_psload();

struct ubcsp_packet send_packet;
uint8_t send_buffer[512];

struct ubcsp_packet receive_packet;
uint8_t receive_buffer[512];

int fd = -1;

///////// HCI Op Queue /////////////////////////

// Services may spawn threads and then queue commands (e.g., bridgeSetupSvc) from these threads.
static pthread_mutex_t queueLock = PTHREAD_MUTEX_INITIALIZER;

static int queueTail = 0;
static int queueHead = 0;
static uint8_t *dataQueue[64];
static uint16_t lengthQueue[64];
static int channelQueue[64];

void queue_hci_op(u8 *value, u16 length, int channel) {
	// Channel: 5 --> HCI_COMMAND
	// Channel: 6 --> ACL
	// Channel: 8 --> L2CAP
	pthread_mutex_lock(&queueLock);
	dataQueue[queueTail] = value;
	lengthQueue[queueTail] = length;
	channelQueue[queueTail] = channel;
	queueTail++;
	pthread_mutex_unlock(&queueLock);
}

static void dequeueIntoSendPacket() {
	pthread_mutex_lock(&queueLock);
	if (queueHead < queueTail) {
		send_packet.channel  = channelQueue[queueHead];
		send_packet.reliable = 1;
		send_packet.length   = lengthQueue[queueHead];
		memcpy(send_packet.payload, dataQueue[queueHead], send_packet.length);
		free(dataQueue[queueHead]);
		queueHead++;
		if (queueHead == queueTail) {
			queueHead = queueTail = 0;
		}
		ubcsp_send_packet(&send_packet);
	}
	pthread_mutex_unlock(&queueLock);
}

static u16 getOpFromSendPacket() {
	u16 resp = 0;
	pthread_mutex_lock(&queueLock);
	resp = dataQueue[queueHead][1] << 8 | dataQueue[queueHead][0];
	if (queueHead < queueTail) {
		pthread_mutex_unlock(&queueLock);	
		return resp;
	} else {
		pthread_mutex_unlock(&queueLock);	
		return 0;
	}
}

static int isQueueEmpty() {
	int isIt;
	pthread_mutex_lock(&queueLock);
	isIt = queueHead == queueTail;
	pthread_mutex_unlock(&queueLock);
	return isIt;
}

u16 queueSize() {
	u16 size;
	pthread_mutex_lock(&queueLock);
	size = queueTail - queueHead;
	pthread_mutex_unlock(&queueLock);
	return size;
}
///////////////////////////////////////////////////////
int hci_open_device_internal(char *device) {
	struct termios ti;
	uint8_t delay, activity = 0x00;
	int timeout = 0;

	if (!device)
		device = "/dev/ttyS0";

	fd = open(device, O_RDWR | O_NOCTTY);
	if (fd < 0) {
		fprintf(stderr, "Can't open serial port: %s (%d)\n",
						strerror(errno), errno);
		return ERROR;
	}

	tcflush(fd, TCIOFLUSH);

	if (tcgetattr(fd, &ti) < 0) {
		fprintf(stderr, "Can't get port settings: %s (%d)\n",
						strerror(errno), errno);
		close(fd);
		return ERROR;
	}

	cfmakeraw(&ti);

	ti.c_cflag |=  CLOCAL;
	ti.c_cflag &= ~CRTSCTS;
	ti.c_cflag |=  PARENB;
	ti.c_cflag &= ~PARODD;
	ti.c_cflag &= ~CSIZE;
	ti.c_cflag |=  CS8;
	ti.c_cflag &= ~CSTOPB;

	ti.c_cc[VMIN] = 1;
	ti.c_cc[VTIME] = 0;

	cfsetospeed(&ti, B115200);

	if (tcsetattr(fd, TCSANOW, &ti) < 0) {
		fprintf(stderr, "Can't change port settings: %s (%d)\n",
						strerror(errno), errno);
		close(fd);
		return ERROR;
	}

	tcflush(fd, TCIOFLUSH);

	if (fcntl(fd, F_SETFL, fcntl(fd, F_GETFL, 0) | O_NONBLOCK) < 0) {
		fprintf(stderr, "Can't set non blocking mode: %s (%d)\n",
						strerror(errno), errno);
		close(fd);
		return ERROR;
	}

	memset(&send_packet, 0, sizeof(send_packet));
	memset(&receive_packet, 0, sizeof(receive_packet));

	ubcsp_initialize();

	send_packet.length = 512;
	send_packet.payload = send_buffer;

	receive_packet.length = 512;
	receive_packet.payload = receive_buffer;
	
	ubcsp_receive_packet(&receive_packet);

	while (1) {
		delay = ubcsp_poll(&activity);

		if (activity & UBCSP_PACKET_RECEIVED) {
			break;
		}

		if (delay) {
			usleep(delay * 100);

			if (timeout++ > 5000) {
				fprintf(stderr, "Initialization timed out\n");
				return ERROR;
			}
		}
	}

	return OK;
}

void hci_close_device(void)
{
	if (fd != -1) {
		close(fd);
		fd = -1;
	}
}

void put_uart(uint8_t ch)
{
	if (write(fd, &ch, 1) < 0) {
		fprintf(stderr, "UART write error\n");
	}
}

uint8_t get_uart(uint8_t *ch) {
	int res = read(fd, ch, 1);
	return res > 0 ? res : 0;
}

int hci_powerup_device() {
	printf("Calling btsetup\n");

	if (system("/opt/playground/bin/btsetup.sh") < 0) {
		printf("Error executing init script\n");
		return ERROR;
	}
	return OK;
}

int hci_reset() {
	// BCSP Cold Reset
/*	if (fd != -1) {
		int res = csr_write_bcsp(CSR_VARID_COLD_RESET, NULL, 0);
	}*/

	return cmd_psload();
}

int hci_open_device(char *device) {
	if (hci_powerup_device() == ERROR) {
		printf("Error powering up the BT chipset\n");
		return ERROR;
	}

	int res = hci_open_device_internal(NULL);
	if (res == ERROR) {
		printf("Error initializing the UART\n");
		return ERROR;
	}

	return cmd_psload();
}


// Add support to make this async. We need to pass a callback method to report the response.
// The current code supports a window of 1 command, so we can keep the callback as a global
// variable until we get a response.
int hci_cmd_send(struct xhci *hci, u16 op, const void *data, int dlen) {
	int r;
	u8 delay, activity;

	if ((dlen < 0) || (dlen > 255)) return ERROR;
	u8 *tmp = (u8 *) malloc(sizeof(u8) * (dlen + 3));

	tmp[0] = op;
	tmp[1] = op >> 8;
	tmp[2] = dlen;
	memcpy(tmp + 3, data, dlen);

	printf("SENDING HCI_COMMAND\n");
	int i;
	for (i = 0; i < dlen + 3; i++) {
		printf("%02x ", tmp[i]);
	}
	printf("\n");
	
	// Last 5 --> HCI_COMMAND Channel (BCSP)
	queue_hci_op(tmp, dlen + 3, 5);
	return OK;
}

int hci_acl_send(xhci *hci, const void *hdr, int hlen, const void *data, int dlen) {
	int r, xfer;

	u8 *allData = (u8 *) malloc(sizeof(u8) * (hlen + dlen));
	memcpy(allData, hdr, hlen);
	memcpy(allData + hlen, data, dlen);

	printf("SENDING HCI_DATA\n");
	int i;
	for (i = 0; i < hlen + dlen; i++) {
		printf("%02x ", allData[i]);
	}
	printf("\n");

	// Last 6 --> ACL Data
	queue_hci_op(allData, hlen + dlen, 6);

	return OK;
}

/*
 * This method drives the state machine to interact with the UART over BCSP. The code assumes a 1 command window.
 * Therefore, we send a command, wait for the UBCSP_PACKET_RECEIVED activity and do the following:
 *    1. If we get a COMMAND_COMPLETE code, we check with the op code we sent and if they match we write the next command (if any)
 *    2. If we get a COMMAND_STATUS code, we keep waiting  
 * 
 * For notifications, we need to add extra logic because we are not expecting any READ operation (all have been processed already)
 * and therefore we would never send anything
 */
void hci_do_poll() {
	uint8_t delay, activity;
	int timeout;
	int responseExpected = 0;

	// This triggers when to fetch a new command. It will depend on wheter we wrote / read a packet and whether we
	// are expecting a response
	int fetchNewCommand = 1;

	u16 sentCommand = 0;

	printf("@@@@@@@@@@@@@@@@@@@@ ########################################\n");
	receive_packet.length = 512;
	ubcsp_receive_packet(&receive_packet);
	timeout = 0;	

	while (1) {
		delay = ubcsp_poll(&activity);

		if (activity & UBCSP_PACKET_SENT) {
			if (!responseExpected) {
				fetchNewCommand = 1;
			}	
		}

		if (activity & UBCSP_PACKET_RECEIVED) {
			u8 code = 0;
			u16 operation = 0;

			if (receive_packet.channel == HCI_EVENT_CHANNEL) {
				printf("OnEvent:\n");
				int ii = 0;
				for (ii; ii < receive_packet.length; ii++) {
					printf("%02x ", receive_packet.payload[ii]);
				}
				printf("\n");

				hci_bridge_send(HCI_EVENT, receive_packet.payload, receive_packet.length);

				// No native handling
				/*if (hci_handle_evt(NULL, receive_packet.payload, receive_packet.length, &code, &operation) == OK) {
					if (code == HCI_COMMAND_COMPLETE_EVT || code == HCI_COMMAND_STATUS_EVT) {
						if (operation != sentCommand) {
							printf("Got a response that does not match the expected result for the command: code:%02x op:%04x\n", code, operation);
							return;
						}
					} 
					printf("HANDLED HCI EVENT\n\n");
				} else {
					printf("Error processing incoming event: %04x\n", receive_packet.payload[1]<<8 | receive_packet.payload[0]);
					return;
				}*/
			} else if (receive_packet.channel == HCI_ACL_CHANNEL) {
				printf("OnAcl:\n");
				int ii = 0;
				for (ii; ii < receive_packet.length; ii++) {
					printf("%02x ", receive_packet.payload[ii]);
				}
				printf("\n");

				hci_bridge_send(HCI_DATA, receive_packet.payload, receive_packet.length);
			
				// No native handling
/*				if (hci_handle_acl(NULL, receive_packet.payload, receive_packet.length) != OK) {
					printf("Error processing incoming acl: %04x\n", receive_packet.payload[1]<<8 | receive_packet.payload[0]);
					return;
				}
				printf("HANDLED ACL\n\n");*/
			} 

			responseExpected = 0;
			fetchNewCommand = 1;
			receive_packet.length = 512;
			ubcsp_receive_packet(&receive_packet);
		} 


		if (fetchNewCommand && !isQueueEmpty()) {
			printf("On HCI Command\n");
			sentCommand = getOpFromSendPacket();
			dequeueIntoSendPacket();
			responseExpected = 1;
			fetchNewCommand = 0;
		}

		if (delay) {
			//timeout++;	
			usleep(delay * 100);
		}

/*		if (timeout == 2000) {
			timeout = 0;
			printf("TIMEOUT DO POLL\n");
			//return;
			dequeueIntoSendPacket();
		}*/
	}
}


