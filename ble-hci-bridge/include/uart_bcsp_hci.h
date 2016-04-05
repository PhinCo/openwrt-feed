#ifndef _UART_BCSP_HCI_
#define _UART_BCSP_HCI_

#include <ubcsp.h>
#include <constants.h>
#include <stdint.h>

int hci_open_device(char *device);
void hci_do_poll();
void hci_close_device(void);
void queue_hci_op(uint8_t *value, uint16_t length, int channel);
uint16_t queueSize();

#endif
