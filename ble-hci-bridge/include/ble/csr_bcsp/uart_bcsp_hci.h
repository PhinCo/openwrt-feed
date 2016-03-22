#ifndef _UART_BCSP_HCI_
#define _UART_BCSP_HCI_

#include <ble/csr_bcsp/ubcsp.h>
#include <ble/ble.h>

int hci_open_device(char *device);
void hci_do_poll();
void hci_close_device(void);
int hci_cmd_send(struct xhci *hci, u16 op, const void *data, int dlen);
int hci_acl_send(xhci *hci, const void *hdr, int hlen, const void *data, int dlen);
void queue_hci_op(u8 *value, u16 length, int channel);
int hci_open_device_internal(char *device);
u16 queueSize();
int hci_reset();

#endif
