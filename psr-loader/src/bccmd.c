/*
 *
 *  BlueZ - Bluetooth protocol stack for Linux
 *
 *  Copyright (C) 2004-2010  Marcel Holtmann <marcel@holtmann.org>
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
#include "csr.h"

#define CSR_STORES_PSI		(0x0001)
#define CSR_STORES_PSF		(0x0002)
#define CSR_STORES_PSROM	(0x0004)
#define CSR_STORES_PSRAM	(0x0008)
#define CSR_STORES_DEFAULT	(CSR_STORES_PSI | CSR_STORES_PSF)

#define ERROR -1
#define OK     0	

int open_device(char *device);
int close_device();
void do_poll();

int main(int argc, char **argv) {
	uint8_t array[256];
	uint16_t pskey, length, size, stores = CSR_STORES_PSRAM;
	char *str, val[7];
	int err, reset = 1;

	if (open_device(NULL) == ERROR) {
		printf("Error opening the UART\n");
		return ERROR;
	}

	if (psr_read("/opt/playground/default.psr") < 0) {
		printf("Error loading PSR commands\n");
		return -1;
	}

	memset(array, 0, sizeof(array));
	size = sizeof(array) - 6;

	while (psr_get(&pskey, array + 6, &size) == 0) {
		str = csr_pskeytoval(pskey);
		if (!strcasecmp(str, "UNKNOWN")) {
			sprintf(val, "0x%04x", pskey);
			str = NULL;
		}

		printf("Loading %s%s ... ", str ? "PSKEY_" : "",
							str ? str : val);
		fflush(stdout);

		length = size / 2;

		array[0] = pskey & 0xff;
		array[1] = pskey >> 8;
		array[2] = length & 0xff;
		array[3] = length >> 8;
		array[4] = stores & 0xff;
		array[5] = stores >> 8;

		err = csr_write_bcsp(CSR_VARID_PS, array, size + 6);

		printf("%s\n", err < 0 ? "failed" : "done");

		memset(array, 0, sizeof(array));
		size = sizeof(array) - 6;
	}

	if (reset)
		csr_write_bcsp(CSR_VARID_WARM_RESET, NULL, 0);

	close_device();

	exit(0);
}
