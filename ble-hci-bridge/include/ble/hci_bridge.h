#ifndef _HCI_PROXY__
#define _HCI_PROXY__

#include <ble/constants.h>
#include <ble/ble.h>
#include <ble/csr_bcsp/uart_bcsp_hci.h>

#define HCI_BRIDGE_OK 		0
#define HCI_BRIDGE_ERROR	1

#define HCI_COMMAND 				0x01
#define HCI_DATA					0x02
#define HCI_EVENT					0x04
#define PLAYGROUND_INTERNAL_COMMAND 0x08

// List of internal commands
#define PG_CREATE_KEY_PAIR			0x01
#define PG_GET_PUB_KEY				0x02
#define PG_DERIVE_SECRET			0x03
#define	PG_AES_ENCRYPT				0x04
#define PG_AES_DECRYPT				0x05
#define PG_PUBLIC_DECRYPT			0x06
#define PG_INTERNAL_STATUS  		0x07
// End of list of internal commands

int hci_bridge_start(int port);

// Puts the data on a socket using the following encoding:
// 2 bytes: size
// 1 byte:  commandType (HCI_EVENT, HCI_DATA)
// n bytes: payload
int hci_bridge_send(u8 commandType, u8 *data, u16 length);

#endif
