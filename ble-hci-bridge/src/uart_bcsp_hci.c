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

#include <uart_bcsp_hci.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <hci_bridge.h>
#include <termios.h>
#include <pthread.h>

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

void queue_hci_op(uint8_t *value, uint16_t length, int channel) {
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

static uint16_t getOpFromSendPacket() {
	uint16_t resp = 0;
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

uint16_t queueSize() {
	uint16_t size;
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
		return PG_ERROR;
	}

	tcflush(fd, TCIOFLUSH);

	if (tcgetattr(fd, &ti) < 0) {
		fprintf(stderr, "Can't get port settings: %s (%d)\n",
						strerror(errno), errno);
		close(fd);
		return PG_ERROR;
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
		return PG_ERROR;
	}

	tcflush(fd, TCIOFLUSH);

	if (fcntl(fd, F_SETFL, fcntl(fd, F_GETFL, 0) | O_NONBLOCK) < 0) {
		fprintf(stderr, "Can't set non blocking mode: %s (%d)\n",
						strerror(errno), errno);
		close(fd);
		return PG_ERROR;
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
				return PG_ERROR;
			}
		}
	}
	return PG_OK;
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
	if (system("/etc/btsetup.sh") < 0) {
		printf("Error executing init script\n");
		return PG_ERROR;
	}
	return PG_OK;
}

int hci_open_device(char *device) {
	if (hci_powerup_device() == PG_ERROR) {
		return PG_ERROR;
	}

	if (system("/bin/psrloader") < 0) {
		printf("Error executing psr-loader\n");
		return PG_ERROR;
	}

	int res = hci_open_device_internal(NULL);
	if (res == PG_ERROR) {
		return PG_ERROR;
	}

	return PG_OK;
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

	uint16_t sentCommand = 0;

	printf("Starting State Machine\n");
	receive_packet.length = 512;
	ubcsp_receive_packet(&receive_packet);
	timeout = 0;	

	while (1) {
		delay = ubcsp_poll(&activity);

		if (activity & UBCSP_PACKET_SENT) {
			timeout=0;
			if (!responseExpected) {
				fetchNewCommand = 1;
			}	
		}

		if (activity & UBCSP_PACKET_RECEIVED) {
			timeout=0;
			uint8_t code = 0;
			uint16_t operation = 0;

			if (receive_packet.channel == HCI_EVENT_CHANNEL) {
				printf("OnEvent:\n");
				int ii = 0;
				for (ii; ii < receive_packet.length; ii++) {
					printf("%02x ", receive_packet.payload[ii]);
				}
				printf("\n");

				if (receive_packet.payload[0] != 0x10) {
					hci_bridge_send(HCI_EVENT, receive_packet.payload, receive_packet.length);
				} else {
					printf("HARDWARE ERROR. IGNORING THE EVENT\n");
				}
			} else if (receive_packet.channel == HCI_ACL_CHANNEL) {
				printf("OnAcl:\n");
				int ii = 0;
				for (ii; ii < receive_packet.length; ii++) {
					printf("%02x ", receive_packet.payload[ii]);
				}
				printf("\n");

				hci_bridge_send(HCI_DATA, receive_packet.payload, receive_packet.length);
			} 

			responseExpected = 0;
			fetchNewCommand = 1;
			receive_packet.length = 512;
			ubcsp_receive_packet(&receive_packet);
		} 


		if (fetchNewCommand && !isQueueEmpty()) {
			printf("On HCI Command / Data\n");
			dequeueIntoSendPacket();
			responseExpected = 1;
			fetchNewCommand = 0;
		}

		if (delay) {
			usleep(delay * 100);
			if (!fetchNewCommand) {
				timeout++;
				printf("Timeout: %d -- Fetch: %d\n", timeout, fetchNewCommand);
			}

			if (timeout >= 10000 && fetchNewCommand == 0) {
				fetchNewCommand = 1;
				responseExpected = 1;
				hci_bridge_send(PLAYGROUND_TIMEOUT, NULL, 0);
			}
		}
	}
}


