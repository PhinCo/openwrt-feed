// Copyright (c) 2015 Playground Global LLC. All rights reserved.

#include <ble/csr_bcsp/uart_bcsp_hci.h>
#include <err.h>
#include <stdio.h>
#include <string.h>
#include <malloc.h>
#include <ble/log.h>
#include <ble/hci_bridge.h>
#include <stdlib.h>

int main(int argc, char **argv) {
	printf("Starting BLE code\n");

	int res = hci_open_device(NULL);
	if (res != OK) {
		printf("Error initializing the UART\n");
		exit(1);
	}
	printf("UART Properly initialized\n");

	if (hci_bridge_start(8080) == ERROR) {
		printf("Error starting server\n");
	}

	hci_do_poll();
	hci_close_device();
}
