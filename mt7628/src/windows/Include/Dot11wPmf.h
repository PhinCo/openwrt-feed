/****************************************************************************
 * Ralink Tech Inc.
 * 4F, No. 2 Technology 5th Rd.
 * Science-based Industrial Park
 * Hsin-chu, Taiwan, R.O.C.
 * (c) Copyright 2002, Ralink Technology, Inc.
 *
 * All rights reserved. Ralink's source code is an unpublished work and the
 * use of a copyright notice does not imply otherwise. This source code
 * contains confidential trade secret material of Ralink Tech. Any attemp
 * or participation in deciphering, decoding, reverse engineering or in any
 * way altering the source code is stricitly prohibited, unless the prior
 * written consent of Ralink Technology, Inc. is obtained.
 ****************************************************************************

    Module Name:
    dot11w_pmf.h
 
    Abstract:
    Defined status code, IE and frame structures that PMF (802.11w-D8.0) needed.
 
    Revision History:
    Who          When          What
    ---------    ----------    ----------------------------------------------
    Albert Yang  4-02-2009     created for IEEE802.11W PMF
 */

#ifndef __DOT11WPMF_H
#define __DOT11WPMF_H

//copy from linux dot11i_wpa.h
// RSN IE Length definition //
#define LEN_TK                      16  // The length Temporal key.
#define LEN_TKIP_MIC                8   // The length of TX/RX Mic of TKIP
#define LEN_TK2                     (2 * LEN_TKIP_MIC)

#define LEN_TKIP_PTK                LEN_PTK
#define LEN_AES_PTK                 (LEN_PTK_KCK + LEN_PTK_KEK + LEN_TK)
#define LEN_TKIP_GTK                (LEN_TK + LEN_TK2)
#define LEN_AES_GTK                 LEN_TK
#define LEN_TKIP_TK                 (LEN_TK + LEN_TK2)
#define LEN_AES_TK                  LEN_TK

#define OFFSET_OF_PTK_TK            (LEN_PTK_KCK + LEN_PTK_KEK) // The offset of the PTK Temporal key in PTK
#define OFFSET_OF_AP_TKIP_TX_MIC    (OFFSET_OF_PTK_TK + LEN_TK)
#define OFFSET_OF_AP_TKIP_RX_MIC    (OFFSET_OF_AP_TKIP_TX_MIC + LEN_TKIP_MIC)
#define OFFSET_OF_STA_TKIP_RX_MIC   (OFFSET_OF_PTK_TK + LEN_TK)
#define OFFSET_OF_STA_TKIP_TX_MIC   (OFFSET_OF_AP_TKIP_TX_MIC + LEN_TKIP_MIC)

#define LEN_KDE_HDR                 6
#define LEN_NONCE                   32
#define LEN_PN                      6
#define LEN_TKIP_IV_HDR             8
#define LEN_CCMP_HDR                8
#define LEN_CCMP_MIC                8
#define LEN_OUI_SUITE               4
#define LEN_WEP_TSC                 3
#define LEN_WPA_TSC                 6
#define LEN_WEP_IV_HDR              4
#define LEN_ICV                     4
//

#define LEN_PMF_MMIE            16
#define PMF_CIPHER_SUITE_LEN    4
#define LEN_PMF_BIP_AAD_HDR     20
#define LEN_PMF_BIP_MIC         8
#define LEN_PMF_IGTK_KDE        24


//Messages for the PMF state machine,
#define PMF_IDLE                        0
#define PMF_CONFIRM                     1
//#define PMF_INDICATE                    2
#define PMF_MAX_STATE                   2

#define PMF_MACHINE_BASE                0
#define PMF_MLME_SAQUERY_REQ            0
#define PMF_MLME_SAQUERY_RSP            1
#define PMF_PEER_SAQUERY_RSP            2
#define PMF_MLME_SAQUERY_CONFIRM        3
#define PMF_MAX_MSG                     4

#define STA_PMF_FUNC_SIZE                (PMF_MAX_STATE * PMF_MAX_MSG)

/* PMF Action filed value */
#define PMF_ACTION_SAQUERY_REQ      0
#define PMF_ACTION_SAQUERY_RSP      1

/* Information element ID defined in 802.11W-D8.0 specification. */
#define IE_PMF_MMIE             76

/* SAQuery Timers */
#define SAQueryRetryTimeout 201
#define SAQueryMaximumTimeout 1000

/* The definition in IEEE 802.11w/D10.0 - Table 7-32 Cipher suite selectors */
extern UCHAR        OUI_PMF_BIP_CIPHER[];

/* The definition in IEEE 802.11w/D10.0 - Table 7-34 AKM suite selectors */
extern UCHAR        OUI_PMF_8021X_AKM[];
extern UCHAR        OUI_PMF_PSK_AKM[];

/* The Key ID filed */
typedef union _PMF_IGTK_KEY_ID
{
    struct
    {
#ifdef RT_BIG_ENDIAN
    UINT16 :4;
    UINT16 KeyId:12;
#else
    UINT16 KeyId:12;
    UINT16 :4;
#endif
    } field;
    UINT16 word;
} PMF_IGTK_KEY_ID, *PPMF_IGTK_KEY_ID;

#pragma pack( push, struct_pack1)
#pragma pack(1)

/* The SubIE of Fast BSS transition information element */
typedef struct _FT_IGTK_SUB_ELEMENT
{
    UINT8 KeyID[2];     /* indicates the value of the BIP key ID */
    UINT8 IPN[6];       /* indicates the receive sequence counter for the IGTK being installed */
    UINT8 KeyLen;       /* the length of IGTK in octets */
    UINT8 Key[24];      /* The length of the resulting AES-Keywrapped IGTK in the Key field */
} FT_IGTK_SUB_ELEMENT, *PFT_IGTK_SUB_ELEMENT;

/* Management MIC information element */
typedef struct _PMF_MMIE
{
    UINT8 KeyID[2];     /* identifies the IGTK used to compute the MIC */
    UINT8 IPN[6];       /* indicates the receive sequence counter for the IGTK being installed */   
    UINT8 MIC[LEN_PMF_BIP_MIC];     /* The length of the resulting AES-Keywrapped IGTK in the Key field */
} PMF_MMIE, *PPMF_MMIE;

/* IGTK KDE format */
typedef struct _PMF_IGTK_KDE
{
    UINT8 KeyID[2];     /* identifies the IGTK used to compute the MIC */
    UINT8 IPN[6];       /* indicates the receive sequence counter for the IGTK being installed */   
    UINT8 IGTK[0];      /* The length of the IGTK */
} PMF_IGTK_KDE, *PPMF_IGTK_KDE;


/* =====================
 *  PMF SA Query Action 
 * ===================== */
typedef struct _PMF_SA_QUERY_ACTION
{   
    UCHAR   Category;   
    UCHAR   Action;

    /*  a 16-bit non-negative counter value */
    UINT8   TransactionID[2];
} PMF_SA_QUERY_ACTION, *PPMF_SA_QUERY_ACTION;

#pragma pack(pop, struct_pack1)

#endif /* __DOT11W_PMF_H */
