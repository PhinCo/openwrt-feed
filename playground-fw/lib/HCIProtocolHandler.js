var Logger = require('./Logger');

const ERROR 						= -1;

const HCI_COMMAND					= 0x01;
const HCI_DATA 						= 0x02;
const HCI_EVENT 					= 0x04;

const AD_FLAGS 						= 0x01;
const AD_SVC_CLASS_LIST_16BIT_SOME 	= 0x02;
const AD_SVC_CLASS_LIST_16BIT_ALL 	= 0x03;
const AD_SVC_CLASS_LIST_32BIT_SOME 	= 0x04;
const AD_SVC_CLASS_LIST_32BIT_ALL 	= 0x05;
const AD_SVC_CLASS_LIST_128BIT_SOME = 0x06;
const AD_SVC_CLASS_LIST_128BIT_ALL 	= 0x07;
const AD_SHORT_LOCAL_NAME    		= 0x08;
const AD_FULL_LOCAL_NAME              = 0x09;
const AD_TX_POWER_LEVEL               = 0x0A;
const AD_CLASS_OF_DEVICE              = 0x0D;
const AD_DEVICE_ID                    = 0x10;
const AD_CONN_INTERVAL_RANGES         = 0x12;
const AD_APPEARANCE                   = 0x19;
const AD_ADVERTISING_INTERVAL         = 0x1A;
const AD_LE_ROLE                      = 0x1C;
const AD_MANUFACTURER_SPECIFIC_DATA   = 0xFF;

// Definitions for HCI groups
const HCI_GRP_LINK_CONTROL_CMDS		= (0x01 << 10); /* 0x0400 */
const HCI_GRP_LINK_POLICY_CMDS        = (0x02 << 10); /* 0x0800 */
const HCI_GRP_HOST_CONT_BASEBAND_CMDS = (0x03 << 10); /* 0x0C00 */
const HCI_GRP_INFORMATIONAL_PARAMS    = (0x04 << 10); /* 0x1000 */
const HCI_GRP_STATUS_PARAMS           = (0x05 << 10); /* 0x1400 */
const HCI_GRP_TESTING_CMDS            = (0x06 << 10); /* 0x1800 */
const HCI_GRP_VENDOR_SPECIFIC         = (0x3F << 10); /* 0xFC00 */

/* BLE HCI */
const HCI_GRP_BLE_CMDS                = (0x08 << 10);
/* Commands of BLE Controller setup and configuration */
const HCI_BLE_SET_EVENT_MASK         	= (0x0001 | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_BUFFER_SIZE        = (0x0002 | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_LOCAL_SPT_FEAT     = (0x0003 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_LOCAL_SPT_FEAT    = (0x0004 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_RANDOM_ADDR       = (0x0005 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_ADV_PARAMS        = (0x0006 | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_ADV_CHNL_TX_POWER  = (0x0007 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_ADV_DATA          = (0x0008 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_SCAN_RSP_DATA     = (0x0009 | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_ADV_ENABLE        = (0x000A | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_SCAN_PARAMS       = (0x000B | HCI_GRP_BLE_CMDS);
const HCI_BLE_WRITE_SCAN_ENABLE       = (0x000C | HCI_GRP_BLE_CMDS);
const HCI_BLE_CREATE_LL_CONN          = (0x000D | HCI_GRP_BLE_CMDS);
const HCI_BLE_CREATE_CONN_CANCEL      = (0x000E | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_WHITE_LIST_SIZE    = (0x000F | HCI_GRP_BLE_CMDS);
const HCI_BLE_CLEAR_WHITE_LIST        = (0x0010 | HCI_GRP_BLE_CMDS);
const HCI_BLE_ADD_WHITE_LIST          = (0x0011 | HCI_GRP_BLE_CMDS);
const HCI_BLE_REMOVE_WHITE_LIST       = (0x0012 | HCI_GRP_BLE_CMDS);
const HCI_BLE_UPD_LL_CONN_PARAMS      = (0x0013 | HCI_GRP_BLE_CMDS);
const HCI_BLE_SET_HOST_CHNL_CLASS     = (0x0014 | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_CHNL_MAP           = (0x0015 | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_REMOTE_FEAT        = (0x0016 | HCI_GRP_BLE_CMDS);
const HCI_BLE_ENCRYPT                 = (0x0017 | HCI_GRP_BLE_CMDS);
const HCI_BLE_RAND                    = (0x0018 | HCI_GRP_BLE_CMDS);
const HCI_BLE_START_ENC               = (0x0019 | HCI_GRP_BLE_CMDS);
const HCI_BLE_LTK_REQ_REPLY           = (0x001A | HCI_GRP_BLE_CMDS);
const HCI_BLE_LTK_REQ_NEG_REPLY       = (0x001B | HCI_GRP_BLE_CMDS);
const HCI_BLE_READ_SUPPORTED_STATES   = (0x001C | HCI_GRP_BLE_CMDS);
const HCI_BLE_RESET 					= (0x0020 | HCI_GRP_BLE_CMDS);

/* Commands of HCI_GRP_HOST_CONT_BASEBAND_CMDS */
const HCI_SET_EVENT_MASK              = (0x0001 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_RESET                       = (0x0003 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_SET_EVENT_FILTER            = (0x0005 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_FLUSH                       = (0x0008 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PIN_TYPE               = (0x0009 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PIN_TYPE              = (0x000A | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_CREATE_NEW_UNIT_KEY         = (0x000B | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_STORED_LINK_KEY        = (0x000D | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_STORED_LINK_KEY       = (0x0011 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_DELETE_STORED_LINK_KEY      = (0x0012 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_CHANGE_LOCAL_NAME           = (0x0013 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_LOCAL_NAME             = (0x0014 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_CONN_ACCEPT_TOUT       = (0x0015 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_CONN_ACCEPT_TOUT      = (0x0016 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PAGE_TOUT              = (0x0017 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PAGE_TOUT             = (0x0018 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_SCAN_ENABLE            = (0x0019 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_SCAN_ENABLE           = (0x001A | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PAGESCAN_CFG           = (0x001B | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PAGESCAN_CFG          = (0x001C | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_INQUIRYSCAN_CFG        = (0x001D | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_INQUIRYSCAN_CFG       = (0x001E | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_AUTHENTICATION_ENABLE  = (0x001F | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_AUTHENTICATION_ENABLE = (0x0020 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_ENCRYPTION_MODE        = (0x0021 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_ENCRYPTION_MODE       = (0x0022 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_CLASS_OF_DEVICE        = (0x0023 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_CLASS_OF_DEVICE       = (0x0024 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_VOICE_SETTINGS         = (0x0025 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_VOICE_SETTINGS        = (0x0026 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_AUTO_FLUSH_TOUT        = (0x0027 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_AUTO_FLUSH_TOUT       = (0x0028 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_NUM_BCAST_REXMITS      = (0x0029 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_NUM_BCAST_REXMITS     = (0x002A | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_HOLD_MODE_ACTIVITY     = (0x002B | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_HOLD_MODE_ACTIVITY    = (0x002C | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_TRANSMIT_POWER_LEVEL   = (0x002D | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_SCO_FLOW_CTRL_ENABLE   = (0x002E | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_SCO_FLOW_CTRL_ENABLE  = (0x002F | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_SET_HC_TO_HOST_FLOW_CTRL    = (0x0031 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_HOST_BUFFER_SIZE            = (0x0033 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_HOST_NUM_PACKETS_DONE       = (0x0035 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_LINK_SUPER_TOUT        = (0x0036 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_LINK_SUPER_TOUT       = (0x0037 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_NUM_SUPPORTED_IAC      = (0x0038 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_CURRENT_IAC_LAP        = (0x0039 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_CURRENT_IAC_LAP       = (0x003A | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PAGESCAN_PERIOD_MODE   = (0x003B | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PAGESCAN_PERIOD_MODE  = (0x003C | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PAGESCAN_MODE          = (0x003D | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PAGESCAN_MODE         = (0x003E | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_SET_AFH_CHANNELS            = (0x003F | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
 
const HCI_READ_INQSCAN_TYPE           = (0x0042 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_INQSCAN_TYPE          = (0x0043 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_INQUIRY_MODE           = (0x0044 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_INQUIRY_MODE          = (0x0045 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_PAGESCAN_TYPE          = (0x0046 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_PAGESCAN_TYPE         = (0x0047 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_AFH_ASSESSMENT_MODE    = (0x0048 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_AFH_ASSESSMENT_MODE   = (0x0049 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_EXT_INQ_RESPONSE       = (0x0051 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_EXT_INQ_RESPONSE      = (0x0052 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_REFRESH_ENCRYPTION_KEY      = (0x0053 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_SIMPLE_PAIRING_MODE    = (0x0055 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_SIMPLE_PAIRING_MODE   = (0x0056 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_LOCAL_OOB_DATA         = (0x0057 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_INQ_TX_POWER_LEVEL     = (0x0058 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_INQ_TX_POWER_LEVEL    = (0x0059 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_READ_ERRONEOUS_DATA_RPT     = (0x005A | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_WRITE_ERRONEOUS_DATA_RPT    = (0x005B | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_ENHANCED_FLUSH              = (0x005F | HCI_GRP_HOST_CONT_BASEBAND_CMDS);
const HCI_SEND_KEYPRESS_NOTIF         = (0x0060 | HCI_GRP_HOST_CONT_BASEBAND_CMDS);

/* Commands of HCI_GRP_INFORMATIONAL_PARAMS group */
const HCI_READ_LOCAL_VERSION_INFO    	= (0x0001 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_LOCAL_SUPPORTED_CMDS  	= (0x0002 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_LOCAL_FEATURES        	= (0x0003 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_LOCAL_EXT_FEATURES    	= (0x0004 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_BUFFER_SIZE           	= (0x0005 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_COUNTRY_CODE          	= (0x0007 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_BD_ADDR               	= (0x0009 | HCI_GRP_INFORMATIONAL_PARAMS);
const HCI_READ_DATA_BLOCK_SIZE       	= (0x000A | HCI_GRP_INFORMATIONAL_PARAMS);
 
const HCI_INFORMATIONAL_CMDS_FIRST   	= HCI_READ_LOCAL_VERSION_INFO
const HCI_INFORMATIONAL_CMDS_LAST		= HCI_READ_BD_ADDR

 /*
  **  Definitions for HCI Events
  */
const HCI_INQUIRY_COMP_EVT			= 0x01;
const HCI_INQUIRY_RESULT_EVT         	= 0x02;
const HCI_CONNECTION_COMP_EVT        	= 0x03;
const HCI_CONNECTION_REQUEST_EVT     	= 0x04;
const HCI_DISCONNECTION_COMP_EVT     	= 0x05;
const HCI_AUTHENTICATION_COMP_EVT    	= 0x06;
const HCI_RMT_NAME_REQUEST_COMP_EVT  	= 0x07;
const HCI_ENCRYPTION_CHANGE_EVT      	= 0x08;
const HCI_CHANGE_CONN_LINK_KEY_EVT   	= 0x09;
const HCI_MASTER_LINK_KEY_COMP_EVT   	= 0x0A;
const HCI_READ_RMT_FEATURES_COMP_EVT 	= 0x0B;
const HCI_READ_RMT_VERSION_COMP_EVT  	= 0x0C;
const HCI_QOS_SETUP_COMP_EVT         	= 0x0D;
const HCI_COMMAND_COMPLETE_EVT	 		= 0x0E;
const HCI_COMMAND_STATUS_EVT         	= 0x0F;
const HCI_HARDWARE_ERROR_EVT          	= 0x10;
const HCI_FLUSH_OCCURED_EVT				= 0x11;
const HCI_ROLE_CHANGE_EVT             = 0x12;
const HCI_NUM_COMPL_DATA_PKTS_EVT     = 0x13;
const HCI_MODE_CHANGE_EVT             = 0x14;
const HCI_RETURN_LINK_KEYS_EVT        = 0x15;
const HCI_PIN_CODE_REQUEST_EVT        = 0x16;
const HCI_LINK_KEY_REQUEST_EVT        = 0x17;
const HCI_LINK_KEY_NOTIFICATION_EVT   = 0x18;
const HCI_LOOPBACK_COMMAND_EVT        = 0x19;
const HCI_DATA_BUF_OVERFLOW_EVT       = 0x1A;
const HCI_MAX_SLOTS_CHANGED_EVT       = 0x1B;
const HCI_READ_CLOCK_OFF_COMP_EVT     = 0x1C;
const HCI_CONN_PKT_TYPE_CHANGE_EVT    = 0x1D;
const HCI_QOS_VIOLATION_EVT           = 0x1E;
const HCI_PAGE_SCAN_MODE_CHANGE_EVT   = 0x1F;
const HCI_PAGE_SCAN_REP_MODE_CHNG_EVT = 0x20;
const HCI_FLOW_SPECIFICATION_COMP_EVT = 0x21;
const HCI_INQUIRY_RSSI_RESULT_EVT     = 0x22;
const HCI_READ_RMT_EXT_FEATURES_COMP_EVT = 0x23;
const HCI_ESCO_CONNECTION_COMP_EVT    = 0x2C;
const HCI_ESCO_CONNECTION_CHANGED_EVT = 0x2D;
const HCI_SNIFF_SUB_RATE_EVT          = 0x2E;
const HCI_EXTENDED_INQUIRY_RESULT_EVT = 0x2F;
const HCI_ENCRYPTION_KEY_REFRESH_COMP_EVT = 0x30;
const HCI_IO_CAPABILITY_REQUEST_EVT   = 0x31;
const HCI_IO_CAPABILITY_RESPONSE_EVT  = 0x32;
const HCI_USER_CONFIRMATION_REQUEST_EVT = 0x33;
const HCI_USER_PASSKEY_REQUEST_EVT    = 0x34;
const HCI_REMOTE_OOB_DATA_REQUEST_EVT = 0x35;
const HCI_SIMPLE_PAIRING_COMPLETE_EVT = 0x36;
const HCI_LINK_SUPER_TOUT_CHANGED_EVT = 0x38;
const HCI_ENHANCED_FLUSH_COMPLETE_EVT = 0x39;
const HCI_USER_PASSKEY_NOTIFY_EVT     = 0x3B;
const HCI_KEYPRESS_NOTIFY_EVT         = 0x3C;
const HCI_RMT_HOST_SUP_FEAT_NOTIFY_EVT= 0x3D;
const HCI_PHYSICAL_LINK_COMP_EVT      = 0x40;
const HCI_CHANNEL_SELECTED_EVT        = 0x41;
const HCI_DISC_PHYSICAL_LINK_COMP_EVT = 0x42;
const HCI_PHY_LINK_LOSS_EARLY_WARNING_EVT = 0x43;
const HCI_PHY_LINK_RECOVERY_EVT       = 0x44;
const HCI_LOGICAL_LINK_COMP_EVT       = 0x45;
const HCI_DISC_LOGICAL_LINK_COMP_EVT  = 0x46;
const HCI_FLOW_SPEC_MODIFY_COMP_EVT   = 0x47;
const HCI_NUM_COMPL_DATA_BLOCKS_EVT   = 0x48;
const HCI_SHORT_RANGE_MODE_COMPLETE_EVT = 0x4C;
const HCI_AMP_STATUS_CHANGE_EVT       = 0x4D;

// ULP HCI Event
const HCI_BLE_EVENT                   = 0x3E;
// ULP Event sub code 
const HCI_BLE_CONN_COMPLETE_EVT     	= 0x01;
const HCI_BLE_ADV_PKT_RPT_EVT         = 0x02;
const HCI_BLE_LL_CONN_PARAM_UPD_EVT   = 0x03;
const HCI_BLE_READ_REMOTE_FEAT_CMPL_EVT = 0x04;
const HCI_BLE_LTK_REQ_EVT             = 0x05;
const HCI_EVENT_RSP_FIRST             = HCI_INQUIRY_COMP_EVT;
const HCI_EVENT_RSP_LAST              = HCI_AMP_STATUS_CHANGE_EVT;
const HCI_VENDOR_SPECIFIC_EVT         = 0xFF;  /* Vendor specific events */
const HCI_NAP_TRACE_EVT               = 0xFF;  /* was define 0xFE, 0xFD, change to 0xFF because conflict w/ TCI_EVT and per specification compliant */

const F_ACTIVE 						= 1;
const F_DEAD							= 2;
const BLE_ROLE_MASTER					= 0;
const BLE_ROLE_SLAVE					= 1;

var utils = require('./Utils');

function HCIProtocolHandler(defaultDeviceName) {
	// Dependencies
	this.attProtocolHandler = null;
	this.gapProtocolHandler = null;
	this.commandQueueManager = null;
	this.connectionManager = null;
	// End of dependencies

	// Clients interested in scanning events
	this.scanListeners = [];

	// Used to signal whether or not we are in advertising mode now
	this.sIsAdvertising = false;
	
	// Used to decide whether or not to go into advertising after disconnecting from a master
	this.sShouldAvertise = false;

	this.sDeviceName = defaultDeviceName;

}

HCIProtocolHandler.prototype.onEvent = function(data) {
	Logger.Log('OnEvent:', Logger.HCI_LOGS);
	Logger.Log(data, Logger.HCI_LOGS);

	var opCodeResult = this.handleHciEvent(data);
	this.commandQueueManager.resetLastCommandSent(opCodeResult);
	this.commandQueueManager.sendNextCommand();
}

HCIProtocolHandler.prototype.onAcl = function(data) {
	Logger.Log('OnAcl:', Logger.HCI_LOGS);
	Logger.Log(data, Logger.HCI_LOGS);

	var len = data.length;
	if (len < 4) return false; // short/missing header
	var dataIndex = 0;

	var handle = utils.le16(data, dataIndex);
	dataIndex += 2;
	var plen = utils.le16(data, dataIndex);
	dataIndex += 2;
	len -= 4;

	if (plen != len) {
		Logger.Log('@@@@@@@@@@@@@@@ acl: bad plen: ' + plen + ' != ' + len, Logger.DEBUG);
		//return false;
	}

	var dlen = utils.le16(data, dataIndex);
	dataIndex += 2;
	var ch = utils.le16(data, dataIndex);
	dataIndex += 2;
	len -= 4;
	if (dlen != len) {
		Logger.Log('acl: bad dlen ' + dlen + ' != ' + len, Logger.DEBUG);
		return false;
	}
	handle &= 0xFFF;

	if ( (bc = this.connectionManager.findConnectionHandle(handle, F_ACTIVE)) == null) {
		Logger.Log('acl: rx h=0x' + handle.toString(16) + ' ch=' + ch + ' len=' + len + ' (unknown handle)', Logger.DEBUG);
		return false;
	}

	this.connectionManager.updateLastRequestAccess(handle);

	//Logger.Log('acl: rx h=0x' + handle.toString(16) + ' ch=' + ch + ' len=' + len, Logger.DEBUG);
	return this.attProtocolHandler.commandHandler(bc, ch, data, dataIndex);
}

// This method returns:
// 1. false in case of an error
// 2. undefined in case of a command without an operation
// 3. op in case of CMD_COMPLETE_EVT or CMD_STATUS_EVT
HCIProtocolHandler.prototype.handleHciEvent = function(data) {
	var length = data.length;

	if (data.length < 2) {
		return false;
	}

	var op = undefined;

	var dataIndex = 0;		

	var code = data[dataIndex++];
	var	plen = data[dataIndex++];

	length -= 2;

	if (length < plen) {
		/* malformed: incomplete data */
		return false;
	}

	switch (code) {
		case HCI_COMMAND_COMPLETE_EVT:
			Logger.Log('=====> HCI CMD COMPLETE EVENT: 0x' + code.toString(16), Logger.HCI_LOGS);
			var acceptableCommands = data[dataIndex++];
			length -= 1;
			op = utils.le16(data, dataIndex);
			dataIndex+=2;
			if (plen < 3) {
				// malformed: incompete header
				Logger.Log('Error: Incomplete header', Logger.ERROR);
				return false;
			}
			break;
		case HCI_COMMAND_STATUS_EVT:
			Logger.Log('=====> HCI CMD STATUS EVENT: 0x' + code.toString(16), Logger.HCI_LOGS);
			var acceptableCommands = data[dataIndex++];
			length -= 1;
			op = utils.le16(data, dataIndex);
			if (plen < 4) {
				/* malformed: incomplete header */
				return ERROR;
			}
			break;
		case HCI_NUM_COMPL_DATA_PKTS_EVT:
			Logger.Log('=====> HCI NUM COMPL DATA PKTS EVT: 0x' + code.toString(16), Logger.HCI_LOGS);
			var n, max;
			if (plen < 1) return ERROR;
			max = data[dataIndex++];
			if (plen != (max * 4 + 1)) return false;
			for (n = 0; n < max; n++) {
				var h = utils.le16(data, dataIndex);
				var p = utils.le16(data, dataIndex + 2);
				dataIndex += 4;
				Logger.Log('conn: h=0x' + h.toString(16) + ' pkts=' + p, Logger.HCI_LOGS);
			}
			break;
		case HCI_DISCONNECTION_COMP_EVT:
			Logger.Log('=====> HCI DISCONNECTION COMP EVENT: 0x' + code.toString(16), Logger.DEBUG);
			var handle;
			var bc;

			if (plen < 4) {
				// malformed: incomplete header
				return false;
			}
			if (data[dataIndex]) {
				// disconnect failed
				return false;
			}
			handle = utils.le16(data, dataIndex + 1);
			if ( (bc = this.connectionManager.findConnectionHandle(handle, 0xFFFF)) != null) {
				this.connectionManager.disconnectConnection(bc, handle);
			}
			break;
		case HCI_BLE_EVENT:
			Logger.Log('=====> HCI BLE EVENT: 0x' + code.toString(16), Logger.HCI_LOGS);
			if (plen < 1) {
				// malformed: incomplete header 
				return false;
			}
			code = data[dataIndex++]; // subevent
			plen--;
			switch (code) {
				case HCI_BLE_CONN_COMPLETE_EVT:
					Logger.Log('=====> HCI BLE CONN COMPLETE EVENT: 0x' + code.toString(16), Logger.DEBUG);
					this.ble_connection_complete(data, dataIndex, plen);
					break;
				case HCI_BLE_ADV_PKT_RPT_EVT:
					Logger.Log('=====> HCI BLE ADV PKT RPT EVENT: 0x' + code.toString(16), Logger.HCI_LOGS);
					this.ble_adv_report(data, dataIndex);
					break;
				case HCI_BLE_LL_CONN_PARAM_UPD_EVT:
					Logger.Log('=====> HCI BLE LL CONN PARAM UPD EVT: 0x' + code.toString(16), Logger.HCI_LOGS);
					break; //TODO
				default:
					Logger.Log('unhandled ble event 0x' + code.toString(16), Logger.ERROR);
			}
			break;
		default:
			Logger.Log('unhandled event: ' + code.toString(16), Logger.ERROR);
			return false;
	}
	return op;
}

HCIProtocolHandler.prototype.ble_write = function(bc, ch, data) {
	var hdr = [];

		var len = data.length;
    if (len > 4096) {
    	Logger.Log('ble_write: data length > 4096', Logger.ERROR);
    	return false;
    }

    hdr.push(bc.info.handle & 0xFF);
    hdr.push((bc.info.handle >> 8) & 0xFF);
    hdr.push(len + 4);
    hdr.push((len + 4) >> 8);
    hdr.push(len & 0xFF);
    hdr.push((len >> 8) & 0xFF);
    hdr.push(ch & 0xFF);
    hdr.push((ch >> 8) & 0xFF);

    if ((bc.flags & F_ACTIVE) == 0) {
         return false;
    } else {
     	this.sendHciData(hdr, data);
    }
	return true;
}

//u8 mac[8]
// HCIProtocolHandler.prototype.ble_connect = function(bc, mac) {
// 	bconn *bc;
// 	struct timespec ts;
// 	hci_cc_params p;
// 	u8 data[256];
// 	int s;

// 	***pending_conn = bc;

// 	p.scan_interval = 0xA0;
// 	p.scan_window = 0xA0;
// 	p.filter_policy = 0;
// 	p.peer_addr_type = 0;
// 	memcpy(p.peer_addr, mac, 6);
// 	p.own_addr_type = 0;
// 	p.cint_min = 0xF0;
// 	p.cint_max = 0xF0;
// 	p.clatency = 3;
// 	p.supervision_timeout = 500;
// 	p.min_ce_len = 0x0;
// 	p.max_ce_len = 0xFFFF;
// 	s = hci_cmd(hci, HCI_BLE_CREATE_LL_CONN, &p, sizeof(p), data);
// 	if (s != 1) {
// 	      Log_Log("conn: cmd error %d\n", s);
// 	      os_acquire(&hci_lock);
// 	      pending_conn = 0;
// 	      os_release(&hci_lock);
// 	      s = BLUE_ERR_INTERNAL;
// 	      goto done;
// 	}

// 	pthread_mutex_lock(&hci_lock);
// 	s = clock_gettime(CLOCK_REALTIME, &ts);
// 	ts.tv_sec += 5;
// 	while (((pending_conn->flags & F_ACTIVE) == 0) && (s == 0)) {
// 	      s = pthread_cond_timedwait(&hci_event, &hci_lock, &ts);
// 	}

// 	if (s) {
// 	      Log_Log("conn: internal error %d\n", s);
// 	      s = BLUE_ERR_INTERNAL;
// 	} else {
// 	      if (pending_conn->flags & F_ACTIVE) {
// 	              Log_Log("conn: active\n");
// 	              s = 0;
// 	      } else {
// 	              Log_Log("conn: timeout\n");
// 	              s = BLUE_ERR_TIMEOUT;
// 	      }
// 	}
// 	pending_conn = NULL;
// 	os_release(&hci_lock);
  
// 	done:
// 		if (s) {
// 		      bconn_destroy(bc);
// 		      *_bc = NULL;
// 		} else {
// 		      *_bc = bc;
// 		}
// 		return s;
//};
  
// HCIProtocolHandler.prototype.ble_disconnect = function(bc) {
// 	u8 cmd[256];
// 	int s;
// 	cmd[0] = bc->info.handle;
// 	cmd[1] = bc->info.handle >> 8;
// 	cmd[2] = 0;
// 	bc->flags &= (~F_ACTIVE);
// 	s = hci_cmd(HCI_DISCONNECT, cmd, 3, cmd);
// 	if (s != 1) {
// 	      Log_Log("discon: cmd error %d\n", s);
// 	}
// 	return 0;
// }

HCIProtocolHandler.prototype.ble_connection_complete = function(data, dataIndex, len) {
	if (len != 18) {
		Logger.Log('Incorrect length', Logger.ERROR);
		return false;
	}

	var bcInfo = {};

	bcInfo.status = data[dataIndex++];
	bcInfo.handle = utils.le16(data, dataIndex);
	dataIndex += 2;
	bcInfo.role = data[dataIndex++];
	bcInfo.peer_addr_type = data[dataIndex++];
	bcInfo.peer_addr = data.slice(dataIndex, dataIndex + 6);
	dataIndex += 6;
    
    bcInfo.interval = utils.le16(data, dataIndex); // * 1.25 ms
    dataIndex += 2;
    bcInfo.latency = utils.le16(data, dataIndex); // * 1.25 ms
    dataIndex += 2;
    bcInfo.timeout = utils.le16(data, dataIndex); // * 10 ms
    dataIndex += 2;
    bcInfo.mca = data[dataIndex];
    dataIndex++;


	if (bcInfo.status != 0) {
		Logger.Log('connection failed 0x' + bcInfo.status.toString(16), Logger.ERROR);
		return false;
	}

	Logger.Log(
		'conn: ' + (bcInfo.role ? "S" : "M") + ' ' +
		(bcInfo.peer_addr_type ? "R/" : "P/") + 
   			  bcInfo.peer_addr[5].toString(16) +  
		':' + bcInfo.peer_addr[4].toString(16) +
		':' + bcInfo.peer_addr[3].toString(16) +
		':' + bcInfo.peer_addr[2].toString(16) +
		':' + bcInfo.peer_addr[1].toString(16) +
		':' + bcInfo.peer_addr[0].toString(16) +
		' h=0x' + bcInfo.handle.toString(16) +
		' int=0x' + bcInfo.interval +
		' lat=0x' + bcInfo.latency +
		' tim=0x' + bcInfo.timeout + 
		' mca=0x' + bcInfo.mca, 
		Logger.DEBUG
	);

	if (bcInfo.role) {
		// new slave connection 
		var bc = bconn_create();
		bc.flags = F_ACTIVE;
		bc.info = bcInfo; 
		Logger.Log('conn: new slave connection', Logger.DEBUG);
		this.sIsAdvertising = false;
		this.connectionManager.addConnection(bcInfo.handle, bc);
		this.connectionManager.bleConnectionCallback(bc, 0);
	}

/*		if (pending_conn) {
		memcpy(&pending_conn->info, ci, sizeof(ble_cc_info));
		pending_conn->flags |= F_ACTIVE;
	}*/
}

function bconn_create() {
	var connection = {};
	connection.flags = 0;
	//connection.handle = 0;
	return connection;
}

HCIProtocolHandler.prototype.sendHciCommand = function(cmd, data, callback) {
	if (data != null) {
		if (data.length < 0 || data.length > 255) {
			return false;
		}
	}

	var d = [HCI_COMMAND, cmd & 0xFF, (cmd >> 8) & 0xFF, data ? data.length : 0];

    if (data) {
    	for (var i = 0; i < data.length; i++) {
            d.push(data[i]);
    	}
    }

    var buf = new Buffer([(d.length >> 8) & 0xFF, d.length & 0xFF].concat(d));
    Logger.Log('SENDING HCI_COMMAND', Logger.HCI_LOGS);
    Logger.Log(buf, Logger.HCI_LOGS);
    this.commandQueueManager.queue(cmd, buf, callback);
	this.commandQueueManager.sendNextCommand();
}

HCIProtocolHandler.prototype.sendHciData = function(hdr, data) {
	var d = [HCI_DATA];

	var allData = hdr.concat(data);

    if (allData) {
    	for (var i = 0; i < allData.length; i++) {
            d.push(allData[i]);
    	}
    }

    var packetLenghtHeader = [(d.length >> 8) & 0xFF, d.length & 0xFF];
    var finalArray = packetLenghtHeader.concat(d);

    var buf = new Buffer(finalArray);
    Logger.Log('SENDING HCI_DATA', Logger.HCI_LOGS);
    Logger.Log(buf, Logger.HCI_LOGS);
    this.commandQueueManager.queue(null, buf);
	this.commandQueueManager.sendNextCommand();
}

HCIProtocolHandler.prototype.setup = function() {
	Logger.Log('Sending HCI_RESET', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_RESET);

	Logger.Log('Sending HCI_READ_BD_ADDR', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_READ_BD_ADDR);
	
	Logger.Log('Sending HCI_SET_EVENT_MASK', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_SET_EVENT_MASK,[0xFF,0xFF,0xFB,0xFF,0x07,0xF8,0xBF,0x3D]);
	
	Logger.Log('Sending HCI_BLE_SET_EVENT_MASK', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_BLE_SET_EVENT_MASK,[0x1F,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
}

HCIProtocolHandler.prototype.enableAdvertising = function(enable) {
	Logger.Log('Enabling Advertising: ' + enable, Logger.DEBUG)
	this.sIsAdvertising = enable;
	this.sShouldAdvertise = enable;

	if (enable) {
		var advParams = [
		    0x00, 0x01, // advertising interval min 1.28s
		    0x00, 0x01, // advertising interval max 1.28s
		    0x00,       // connectable undirected advertising
		    0x00,       // own-addr-type: public
		    0x00,       // direct-addr-type: public   
		    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // direct-addr: unused
		    0x07,       // advertising-channel-map: ALL
		    0x00        // advertising-filter-policy
		];

		Logger.Log('Sending HCI_BLE_WRITE_ADV_PARAMS', Logger.HCI_LOGS);
		this.sendHciCommand(HCI_BLE_WRITE_ADV_PARAMS,advParams);

		var partialAdvData = [
		   	0x02, AD_FLAGS, 0x05, // LE limited discoverable mode, No BR/EDR
		   	this.sDeviceName.length + 1, AD_FULL_LOCAL_NAME
		];

		for (var i = 0; i < this.sDeviceName.length; i++) {
			partialAdvData.push(this.sDeviceName.charCodeAt(i));
		}

		var advData = [
		   	partialAdvData.length // data length
		];

		// We need to fill the rest up to 32 bytes with 0. Start at
		// partialAdvData.length + 1 (+ 1 because we need to include
		// 1 byte for the total length)
		for (var i = partialAdvData.length + 1; i < 32; i++) {
			partialAdvData.push(0x00);
		}

		Logger.Log('Sending HCI_BLE_WRITE_ADV_DATA', Logger.HCI_LOGS);
		this.sendHciCommand(HCI_BLE_WRITE_ADV_DATA,advData.concat(partialAdvData));		
	}

	Logger.Log('Sending HCI_BLE_WRITE_ADV_ENABLE', Logger.HCI_LOGS);
    this.sendHciCommand(HCI_BLE_WRITE_ADV_ENABLE, [enable ? 1 : 0]);
}

HCIProtocolHandler.prototype.scan = function(on, callback) {
	var info = [];
	info.push(0x01); // scan type. 0:passive, 1:active
	info.push((0x1000 >> 8) & 0xFF); //scan_interval * 0.625ms
	info.push(0x1000 & 0xFF); 
	info.push((0x1000 >> 8) & 0xFF); //scan_interval * 0.625ms
	info.push(0x1000 & 0xFF); 
	info.push(0x0); //own_addr_type
	info.push(0x0); //filter_policy
	Logger.Log('Sending HCI_BLE_WRITE_SCAN_PARAMS', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_BLE_WRITE_SCAN_PARAMS, info);

	var data = [];
	if (on) {
		data.push(0x1); // enable
	} else {
		data.push(0x0); // disable
	}
	data.push(0x0); // no dup filter
	Logger.Log('Sending HCI_BLE_WRITE_SCAN_ENABLE', Logger.HCI_LOGS);
	this.sendHciCommand(HCI_BLE_WRITE_SCAN_ENABLE, data);

	if (callback !== undefined && callback !== null) {
		this.scanListeners.push(callback);
	}
}

HCIProtocolHandler.prototype.ble_adv_report = function(data, dataIndex) {

	// Response format (page 801 Bluetooth Spec under LE MetaEvents)
	// 1 octet: number responses in event (0x0 - 0x19)
	// For each response
	// 1 octet: event type
	// 1 octet: address type
	// 6 octets: address
	// 1 octet: data length 0x00 - 0x1F (32 max)
	// data length octets: data
	// 1 octet: rssi

	var len = data.length - dataIndex;

	if (len == 0) {
		Logger.Log('Invalid data length for adv_report', Logger.ERROR);
		return;
	}

	var responseCount = data[dataIndex++];
	len--;

	if (responseCount > 0x19) {
		Logger.Log('Too many responses for adv count: ' + responseCount, Logger.ERROR);
		return;
	}

	if (len < 10) {
		Logger.Log('Invalid length for adv report (<10)', Logger.ERROR);
		return;
	}

	for (var n = 0; n < responseCount; n++) {
		// Parse each response
		
		// event type
		var eventType = data[dataIndex++];
		//adv.push(data[dataIndex++]);
		
		// address type
		var addressType = data[dataIndex++];
		//adv.push(data[dataIndex++]);
		
		// 6 octet address
		var address = [];
		address.push(data[dataIndex + 5]);
		address.push(data[dataIndex + 4]);
		address.push(data[dataIndex + 3]);
		address.push(data[dataIndex + 2]);
		address.push(data[dataIndex + 1]);
		address.push(data[dataIndex + 0]);
		dataIndex += 6;
		
		// data length
		var dataLength = data[dataIndex++];
		if (dataLength > 0x1F) {
			Logger.Log('Invalid data length for advertisement', Logger.ERROR);
			return;
		}
		//adv.push(dataLength);

		var eir = [];
		for (var i = 0; i < dataLength; i++) {
			eir.push(data[dataIndex++]);
		}

		// RSSI
		var rssi = data[dataIndex++];
		var resp = this.gapProtocolHandler.parseGAPData(eventType, address, addressType, eir, rssi);
		for (var i = 0; i < this.scanListeners.length; i++) {
			this.scanListeners[i](resp);
		}
	}
}

HCIProtocolHandler.prototype.isAdvertising = function() {
	return this.sIsAdvertising;
}

module.exports = {
	HCIProtocolHandler:HCIProtocolHandler
}