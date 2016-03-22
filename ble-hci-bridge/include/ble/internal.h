// Copyright 2015 Playground Global LLC

#ifndef _INTERNAL_H_
#define _INTERNAL_H_

typedef struct {
	u16 interval_min; // * 0.625 msec  0x20..0x4000 (<= max)
	u16 interval_max; // * 0.625 msec  0x20..0x4000 (>= min)
	u8 type;
	u8 own_addr_type;
	u8 peer_addr_type;
	u8 peer_addr[6];
	u8 adv_chan_map; // default 7 (all channels)
	u8 filter_policy; // 0=any
} __attribute__((packed)) hci_adv_params;

typedef struct {
	u8 scan_type; // 0: passive 1: active
	u16 scan_interval; // * 0.625 ms
	u16 scan_window; // * 0.625 ms
	u8 own_addr_type; // 0:public 1:random
	u8 filter_policy; // 0:all
} __attribute__((packed)) hci_scan_parameters;

typedef struct {
	u8 status;
	u16 acl_plen;
	u8 sco_plen;
	u16 acl_pkts;
	u16 sco_pkts;
} __attribute__((packed)) hci_buffer_size;

typedef struct {
	u8 status;
	u16 acl_plen;
	u8 acl_pkts;
} __attribute__((packed)) hci_le_buffer_size;

typedef union {
	u8 data[256];
	hci_buffer_size buffer_size;
	hci_le_buffer_size le_buffer_size;
} hci_reply;

/* https://www.bluetooth.org/en-us/specification/assigned-numbers-overview/generic-access-profile */
#define AD_FLAGS			0x01
#define AD_SVC_CLASS_LIST_16BIT_SOME	0x02
#define AD_SVC_CLASS_LIST_16BIT_ALL	0x03
#define AD_SVC_CLASS_LIST_32BIT_SOME	0x04
#define AD_SVC_CLASS_LIST_32BIT_ALL	0x05
#define AD_SVC_CLASS_LIST_128BIT_SOME	0x06
#define AD_SVC_CLASS_LIST_128BIT_ALL	0x07
#define AD_SHORT_LOCAL_NAME		0x08
#define AD_FULL_LOCAL_NAME		0x09
#define AD_TX_POWER_LEVEL		0x0A
#define AD_CLASS_OF_DEVICE		0x0D
#define AD_DEVICE_ID			0x10
#define AD_CONN_INTERVAL_RANGES		0x12
#define AD_APPEARANCE			0x19
#define AD_ADVERTISING_INTERVAL		0x1A
#define AD_LE_ROLE			0x1C
#define AD_MANUFACTURER_SPECIFIC_DATA	0xFF

#define FLAGS_LE_LIMITED_DISCOVERABLE	(1 << 0)
#define FLAGS_LE_GENERAL_DISCOVERABLE	(1 << 1)
#define FLAGS_BR_EDR_NOT_SUPPORTED	(1 << 2)

// BLE MAC ADDRS are sent *LITTLE ENDIAN* in HCI cmds: 66:55:44:33:22:11

#define ADV_CONN_UNDIR		0x00 // connectable, undirected
#define ADV_CONN_DIR_HI		0x01 // connectable high duty cycle directed
#define ADV_SCAN_UNDIR		0x02 // scannable undirected
#define ADV_NONCONN_UNDIR	0x03 // non-connectable undirected
#define ADV_CONN_DIR_LO		0x04 // connectable low duty cycle directed

#define ADDR_TYPE_PUBLIC 0x00
#define ADDR_TYPE_RANDOM 0x01

#endif
