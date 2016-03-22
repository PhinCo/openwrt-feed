// Copyright 2015 Playground Global LLC

/*
 *
 * BCSP Specific commands (e.g., reset device). The device must
 * have been opened in advance (see open method in uart_bcsp_hci.c)
 */

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <stdint.h>
#include <termios.h>

#include "ble/csr_bcsp/csr.h"
#include "ble/csr_bcsp/ubcsp.h"

/*extern*/ struct ubcsp_packet send_packet;
/*extern*/ uint8_t send_buffer[512];

/*extern*/ struct ubcsp_packet receive_packet;
/*extern*/ uint8_t receive_buffer[512];

static uint16_t seqnum = 0;

static int do_bcsp_command(uint16_t command, uint16_t seqnum, uint16_t varid, uint8_t *value, uint16_t length)
{
	unsigned char cp[254], rp[254];
	uint8_t cmd[10];
	uint16_t size;
	uint8_t delay, activity = 0x00;
	int timeout = 0, sent = 0;

	size = (length < 8) ? 9 : ((length + 1) / 2) + 5;

	cmd[0] = command & 0xff;
	cmd[1] = command >> 8;
	cmd[2] = size & 0xff;
	cmd[3] = size >> 8;
	cmd[4] = seqnum & 0xff;
	cmd[5] = seqnum >> 8;
	cmd[6] = varid & 0xff;
	cmd[7] = varid >> 8;
	cmd[8] = 0x00;
	cmd[9] = 0x00;

	memset(cp, 0, sizeof(cp));
	cp[0] = 0x00;
	cp[1] = 0xfc;
	cp[2] = (size * 2) + 1;
	cp[3] = 0xc2;
	memcpy(cp + 4, cmd, sizeof(cmd));
	memcpy(cp + 14, value, length);

	receive_packet.length = 512;
	ubcsp_receive_packet(&receive_packet);

	send_packet.channel  = 5;
	send_packet.reliable = 1;
	send_packet.length   = (size * 2) + 4;
	memcpy(send_packet.payload, cp, (size * 2) + 4);
	ubcsp_send_packet(&send_packet);

	while (1) {
		delay = ubcsp_poll(&activity);

		if (activity & UBCSP_PACKET_RECEIVED) {
			if (sent && receive_packet.channel == 5 &&
					receive_packet.payload[0] == 0xff) {
				memcpy(rp, receive_packet.payload,
							receive_packet.length);
				break;
			}

			receive_packet.length = 512;
			ubcsp_receive_packet(&receive_packet);
			timeout = 0;
		}

		if (activity & UBCSP_PACKET_SENT) {
			switch (varid) {
			case CSR_VARID_COLD_RESET:
			case CSR_VARID_WARM_RESET:break; //I added the break because the CSR device sends a packet after a while, so I want to wait until I get it.
											 //otherwise, when I start with HCI I get an invalid event
			case CSR_VARID_COLD_HALT:
			case CSR_VARID_WARM_HALT:
				return 0;
			}

			sent = 1;
			timeout = 0;
		}

		if (delay) {
			usleep(delay * 100);

			if (timeout++ > 1000) {
				fprintf(stderr, "Operation timed out\n");
				return -1;
			}
		}
	}

	if (rp[0] != 0xff || rp[2] != 0xc2) {
		errno = EIO;
		printf("Error 1\n");
		return -1;
	}

	if ((rp[11] + (rp[12] << 8)) != 0) {
		errno = ENXIO;
		printf("Error 2: %02x %02x\n", rp[11], rp[12]);
		return -1;
	}
	memcpy(value, rp + 13, length);

	return 0;
}

/*void csr_commands_setup() {
	memset(&bcsp_receive_packet, 0, sizeof(bcsp_receive_packet));
	bcsp_receive_packet.length = 512;
	bcsp_receive_packet.payload = bcsp_receive_buffer;
	memset(&bcsp_send_packet, 0, sizeof(bcsp_send_packet));
	bcsp_send_packet.length = 512;
	bcsp_send_packet.payload = bcsp_send_buffer;
}*/

int csr_read_bcsp(uint16_t varid, uint8_t *value, uint16_t length) {
	return do_bcsp_command(0x0000, seqnum++, varid, value, length);
}

int csr_write_bcsp(uint16_t varid, uint8_t *value, uint16_t length) {
	return do_bcsp_command(0x0002, seqnum++, varid, value, length);
}

