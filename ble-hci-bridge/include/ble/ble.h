// Copyright 2015 Playground Global LLC

#ifndef _BLE_BLE_H_
#define _BLE_BLE_H_

typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned int u32;

#define HCI_CMD 0x01
#define HCI_ACL 0x02
#define HCI_ISO 0x03
#define HCI_EVT 0x04

/* HCI Low Level Transport */

typedef struct xhci xhci;

void hci_trace(int yes);

// ble io thread calls these to send packets up the stack
int hci_send(xhci *hci, u16 op, const void *data, int dlen);
int acl_send(xhci *hci, const void *hdr, int hlen, const void *data, int dlen);

// ble stack calls these to transmit packets to the controller
int hci_handle_evt(xhci *hci, u8 *data, int len, u8 *code, u16 *op);
int hci_handle_acl(xhci *hci, u8 *data, int len);

xhci *hci_open_uart(int port);
xhci *hci_open_usb_vid_pid(u16 vid, u16 pid);
xhci *hci_open_usb_bus_dev(u8 bus, u8 dev);

int hci_init(xhci *hci);

// reply must point to a buffer of at least 255 bytes
// returns negative on error, or sizeof(reply) on success
int hci_cmd(xhci *hci, u16 op, const void *data, int dlen, u8 *reply);

int ble_parse_addr(char *s, u8 out[6]);

int ble_start_scan(xhci *hci);
int ble_advertise_setup(xhci *hci);
int ble_advertise_enable(xhci *hci, int yes);

#define BLUE_ERR_INTERNAL -256
#define BLUE_ERR_TIMEOUT -257
#define BLUE_ERR_MEMORY -258
#define BLUE_ERR_NOTCONN -259
#define BLUE_ERR_MALFORMED -260

// l2cap connection api
typedef struct bconn bconn;

int ble_connect(xhci *hci, bconn **bc, u8 addr[6]);
int ble_disconnect(bconn *bc);
int ble_write(bconn *bc, u16 ch, void *data, int len);
int ble_read(bconn *bc, u16 ch, void *data, int len);

//extern int (*ble_l2cap_cb)(bconn *bc, u16 ch, u8 *data, int len);
//extern int (*ble_conn_cb)(bconn *bc, int status);

xhci *ble_conn_to_hci(bconn *bc);

// conversion between 17bit handles (bit 16 set) 
// and 128bit uuids
unsigned uuid128tohandle(const u8 *data);
void handletouuid128(unsigned h, u8 *out);

#endif
