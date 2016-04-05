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

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <csr.h>
#include <termios.h>
#include <ubcsp.h>

#define ERROR -1
#define OK     0	

int cmd_psload();

struct ubcsp_packet send_packet;
uint8_t send_buffer[512];

struct ubcsp_packet receive_packet;
uint8_t receive_buffer[512];


int fd = -1;

int open_device(char *device) {
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

void close_device(void) {
	if (fd != -1) {
		close(fd);
		fd = -1;
	}
}

void put_uart(uint8_t ch) {
	if (write(fd, &ch, 1) < 0) {
		fprintf(stderr, "UART write error\n");
	}
}

uint8_t get_uart(uint8_t *ch) {
	int res = read(fd, ch, 1);
	return res > 0 ? res : 0;
}