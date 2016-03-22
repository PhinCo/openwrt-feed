// Copyright 2015 Playground Global LLC

#include <ble/log.h>
#include <ble/gap.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <ble/hci.h>
#include <ble/internal.h>
#include <ble/conn_manager.h>
#include <ble/csr_bcsp/uart_bcsp_hci.h>
#include <ble/constants.h>

static int do_nothing(void) {
	Log_Log("Do nothing\n");
	return OK;
}

static inline u16 U16(u8 *data) {
	return data[0] | (data[1] << 8);
}

int hci_handle_evt(xhci *hci, u8 *data, int len, u8 *code, u16 *op ) { /* code:8 plen:8 */
	*op = 0;

	int plen;
	if (len < 2) {
		/* malformed: incomplete header */
		return ERROR;
	}
	*code = *data++;
	plen = *data++;
	len -= 2;
	if (len < plen) {
		/* malformed: incomplete data */
		return UNHANDLED;
	}

	switch (*code) {
	case HCI_COMMAND_COMPLETE_EVT: /* npkt:8 opcode:16 data:... */
		Log_Log("=====> HCI CMD COMPLETE EVENT: %02X\n", *code);
		*op = U16(data + 1);
		if (plen < 3) {
			/* malformed: incompete header */
			Log_Log("Error: Incomplete header\n");
			return ERROR;
		}
		break;
	case HCI_COMMAND_STATUS_EVT: /* status:8 npkt:8 opcode:16 */
		Log_Log("=====> HCI CMD STATUS EVENT: %02X\n", *code);
		*op = U16(data + 1);
		if (plen < 4) {
			/* malformed: incomplete header */
			return ERROR;
		}
		break;
	case HCI_NUM_COMPL_DATA_PKTS_EVT: {
		Log_Log("=====> HCI NUM COMPL DATA PKTS EVT: %02X\n", *code);
		int n, max;
		if (plen < 1) return ERROR;
		max = *data++;
		if (plen != (max * 4 + 1)) return ERROR;
		for (n = 0; n < max; n++) {
			u16 h = U16(data);
			u16 p = U16(data + 2);
			data += 4;
			Log_Log("conn: h=%03x pkts=%d\n", h, p);
		}
		break;
	}
	case HCI_DISCONNECTION_COMP_EVT: { /* status:8 handle:16 reason:8 */
		Log_Log("=====> HCI DISCONNECTION COMP EVENT: %02X\n", *code);
		u16 handle;
		bconn *bc;
		if (plen < 4) {
			/* malformed: incomplete header */
			return ERROR;
		}
		if (data[0]) {
			/* disconnect failed */
			return ERROR;
		}
		handle = U16(data + 1);
		if ( (bc = findConnectionHandle(handle, 0xFFFF)) != NULL) {
			goto do_discon; 
		}
		break;
do_discon:
		disconnectConnection(bc, handle);
		break;
	}
	case HCI_BLE_EVENT:
		Log_Log("=====> HCI BLE EVENT: %02X\n", *code);
		if (plen < 1) {
			/* malformed: incomplete header */
			return ERROR;
		}
		*code = *data++; /* subevent */
		plen--;
		switch (*code) {
		case HCI_BLE_CONN_COMPLETE_EVT:
			Log_Log("\t=====> HCI BLE CONN COMPLETE EVENT: %02X\n", *code);
			ble_connection_complete(hci, data, plen);
			break;
		case HCI_BLE_ADV_PKT_RPT_EVT:
			Log_Log("\t=====> HCI BLE ADV PKT RPT EVENT: %02X\n", *code);
			ble_adv_report(data, plen);
			break;
		case HCI_BLE_LL_CONN_PARAM_UPD_EVT:
			Log_Log("\t=====> HCI BLE LL CONN PARAM UPD EVT: %02X\n", *code);
			break; //TODO
		default:
			Log_Log("unhandled ble event 0x%02x\n", *code);
		}
		break;
	default:
		Log_Log("unhandled event 0x%02x (%d)\n", *code, plen);
		return UNHANDLED;
	}
	return OK;
}

int hci_handle_acl(xhci *hci, u8 *data, int len) {
	bconn *bc;
	u16 handle;
	u16 plen;
	u16 dlen;
	u16 ch;
	if (len < 4) return 0; // short/missing header
	handle = U16(data);
	plen = U16(data + 2);
	data += 4;
	len -= 4;
	if (plen != len) {
		Log_Log("acl: bad plen %d != %d\n", plen, len);
		return ERROR;
	}
	dlen = U16(data);
	ch = U16(data + 2);
	data += 4;
	len -= 4;
	if (dlen != len) {
		Log_Log("acl: bad dlen %d != %d\n", dlen, len);
		return ERROR;
	}
	handle &= 0xFFF;

	if ( (bc = findConnectionHandle(handle, F_ACTIVE)) != NULL) {
		goto found_it;
	}
	Log_Log("acl: rx h=%03x ch=%d len=%d (unknown handle)\n", handle, ch, len);
	return ERROR;

found_it:
	Log_Log("acl: rx h=%03x ch=%d len=%d\n", handle, ch, len);
	return bc->handler(bc, ch, data, len);
	//return OK;
}

int hci_cmd(xhci *hci, u16 op, const void *data, int dlen, u8 *reply) {
	Log_Log("hci_cmd: %04x\n", op);
	return hci_cmd_send(hci, op, data, dlen);
}

static unsigned char default_le_evt_mask[8] = {
	0x1f, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
};

static unsigned char default_bt_evt_mask[8] = {
	0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x3f,
};

int hci_init(xhci *hci) {
	hci_reply r;
	int s;

	//s = hci_cmd(hci, HCI_RESET, NULL, 0, r.data);
	s = hci_cmd(hci, HCI_READ_BUFFER_SIZE, NULL, 0, r.data);
	if (s == sizeof(r.buffer_size)) {
		Log_Log("bufsiz: acl %d of %d. sco %d of %d.\n",
			r.buffer_size.acl_pkts, r.buffer_size.acl_plen,
			r.buffer_size.sco_pkts, r.buffer_size.sco_plen);
	}
	s = hci_cmd(hci, HCI_BLE_READ_BUFFER_SIZE, NULL, 0, r.data);
	if (s == sizeof(r.le_buffer_size)) {
		Log_Log("bufsiz: acl %d of %d\n",
			r.le_buffer_size.acl_pkts, r.le_buffer_size.acl_plen);
	}
	s = hci_cmd(hci, HCI_READ_BD_ADDR, NULL, 0, r.data);
	Log_Log("bdaddr: %02x:%02x:%02x:%02x:%02x:%02x\n",
		r.data[6], r.data[5], r.data[4],
		r.data[3], r.data[2], r.data[1]);

	hci_cmd(hci, HCI_BLE_READ_WHITE_LIST_SIZE, NULL, 0, r.data);
	hci_cmd(hci, HCI_SET_EVENT_MASK, default_bt_evt_mask, 8, r.data);
	hci_cmd(hci, HCI_BLE_SET_EVENT_MASK, default_le_evt_mask, 8, r.data);

	return OK;
}
