var Logger = require('./Logger');
var AttributeDb = require('./AttributeDb');
var utils = require('./Utils');

const ERROR 						= -1;

var Constants = {
	ATT_L2CAP_CH_ID:					 4,
	ATT_DEFAULT_MTU:					 23,

	ATT_OP_EXCH_MTU_REQ:				 0x02,
	ATT_OP_EXCH_MTU_RESP:				 0x03,
	ATT_OP_FIND_INFO_REQ:				 0x04,
	ATT_OP_FIND_INFO_RESP:				 0x05,
	ATT_FMT_16BIT:						 0x01,
	ATT_FMT_128BIT:					 	 0x02,
	ATT_OP_FIND_BY_TYPE_VALUE_REQ:		 0x06,
	ATT_OP_FIND_BY_TYPE_VALUE_RESP:		 0x07,
	ATT_OP_READ_BY_TYPE_REQ:			 0x08,
	ATT_OP_READ_BY_TYPE_RESP:	 		 0x09,
	ATT_OP_READ_REQ:					 0x0A,
	ATT_OP_READ_RESP:					 0x0B,
	ATT_OP_READ_BLOB_REQ:				 0x0C,
	ATT_OP_READ_BLOB_RESP:				 0x0D,
	ATT_OP_READ_MULTIPLE_REQ:			 0x0E,
	ATT_OP_READ_MULTIPLE_RESP:			 0x0F,
	ATT_OP_READ_BY_GROUP_TYPE_REQ:		 0x10,
	ATT_OP_READ_BY_GROUP_TYPE_RESP:		 0x11,
	ATT_OP_WRITE_REQ:					 0x12,
	ATT_OP_WRITE_RESP:					 0x13,
	ATT_OP_WRITE_COMMAND:				 0x52,
	ATT_OP_PREPARE_WRITE_REQ:			 0x16,
	ATT_OP_PREPARE_WRITE_RESP:			 0x17,
	ATT_OP_EXEC_WRITE_REQ:				 0x18,
	ATT_FLAGS_CANCEL:					 0x00,
	ATT_FLAGS_COMMIT:					 0x01,
	ATT_OP_EXEC_WRITE_RESP:			 	 0x19,
	ATT_OP_HANDLE_VALUE_NOTIFY:		 	 0x1B,
	ATT_OP_HANDLE_VALUE_IND:			 0x1D,
	ATT_OP_HANDLE_VALUE_CONFIRM:		 0x1E,

	ATT_OP_ERROR_RESP:            		 0x01,
	ATT_ERR_INVALID_HANDLE:       		 0x01,
	ATT_ERR_READ_NO_PERM:         		 0x02,
	ATT_ERR_WRITE_NO_PERM:        		 0x03,
	ATT_ERR_INVALID_PDU:          		 0x04,
	ATT_ERR_INSUFFICIENT_AUTH:    		 0x05,
	ATT_ERR_REQUEST_NOT_SUPPORTED:		 0x06,
	ATT_ERR_INVALID_OFFSET:       		 0x07,
	ATT_ERR_INSUFFICIENT_AUTH_2:  		 0x08,
	ATT_ERR_PREPARE_QUEUE_FULL:   		 0x09,
	ATT_ERR_ATTR_NOT_FOUND:       		 0x0A,
	ATT_ERR_ATTR_NOT_LONG:        		 0x0B,
	ATT_ERR_KEY_TOO_SMALL:        		 0x0C,
	ATT_ERR_INVALID_VALUE_LENGTH: 		 0x0D,
	ATT_ERR_UNLIKELY:             		 0x0E,
	ATT_ERR_INSUFFICIENT_CRYPTO:  		 0x0F,
	ATT_ERR_UNSUPPORTED_GROUP_TYPE:		 0x10,
	ATT_ERR_INSUFFICIENT_RESOURCES:		 0x11
}

function ATTProtocolHandler() {
	// Dependencies
	this.attributeDb = null;
	this.hciProtocolHandler = null;
	// End of dependencies

	// Handling multipart writes
	this.queue_hnd = null;
	this.queue_data = new Buffer([]);
}

ATTProtocolHandler.prototype.commandHandler = function(bc, ch, data, dataIndex) {
	var len = data.length;

	if (ch != Constants.ATT_L2CAP_CH_ID) return false;
	if (len < 1) return false;

	var res = Constants.ATT_ERR_INVALID_PDU;
	var op = data[dataIndex++];
	len--;

	switch (op) {
		case Constants.ATT_OP_EXCH_MTU_REQ:
			Logger.Log('@@@@@ ATT OP EXCH MTU', Logger.HCI_LOGS);
			res = this.exchangeMtu(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_READ_REQ:
			Logger.Log('@@@@@ ATT OP READ', Logger.HCI_LOGS);
			res = this.read(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_READ_BLOB_REQ:
			Logger.Log('@@@@ Constants.ATT_OP_READ_BLOB_REQ', Logger.HCI_LOGS);
			res = this.readBlob(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_WRITE_REQ:
			Logger.Log('@@@@@ ATT OP WRITE REQ', Logger.HCI_LOGS);
			res = this.write(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_READ_BY_TYPE_REQ:
			Logger.Log('@@@@@ ATT OP READ BY TYPE', Logger.HCI_LOGS);
			res = this.readByType(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_READ_BY_GROUP_TYPE_REQ:
			Logger.Log('@@@@@ ATT OP READ BY GROUP TYPE', Logger.HCI_LOGS);
			res = this.readByGroupType(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_PREPARE_WRITE_REQ:
			Logger.Log('@@@@@ ATT OP PREPARE WRITE REQ', Logger.HCI_LOGS);
			res = this.writePrepare(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_EXEC_WRITE_REQ:
			Logger.Log('@@@@@ ATT OP EXEC WRITE REQ', Logger.HCI_LOGS);
			res = this.writeExecute(bc, data, dataIndex);
			break;
		case Constants.ATT_OP_FIND_INFO_REQ:
			Logger.Log('@@@@@ ATT OP FIND INFO REQ', Logger.HCI_LOGS);
			res = this.findInfo(bc, data, dataIndex);
			break;
		default:
			Logger.Log('Unknown ble comand: ' + op.toString(16), Logger.HCI_LOGS);
			res = Constants.ATT_ERR_INVALID_PDU;
	}

	if (res) {
		var r = [];
		r.push(Constants.ATT_OP_ERROR_RESP);
		r.push(op);
		r.push( (res >> 8) & 0xFF);
		r.push( (res >> 16) & 0xFF);
		r.push(res);
		this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r);
	}
	return true;
}

ATTProtocolHandler.prototype.exchangeMtu = function(bc, data) {
	var r = [Constants.ATT_OP_EXCH_MTU_RESP, Constants.ATT_DEFAULT_MTU & 0xFF, (Constants.ATT_DEFAULT_MTU >> 8) & 0xFF];
    this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r);
	return 0;
}	

ATTProtocolHandler.prototype.read = function(bc, data, dataIndex) {
	if (data.length - dataIndex != 2) {
		return Constants.ATT_ERR_INVALID_PDU;
	}
	var a;
	var handle;
	handle = utils.le16(data, dataIndex);

	dataIndex += 2;

	if ((a = this.attributeDb.findAttributeByHandle(handle)) == null) {
		return Constants.ATT_ERR_INVALID_HANDLE | (handle << 8);
	}

	var that = this;
	this.attributeDb.getAttributeValue(a, 0, Constants.ATT_DEFAULT_MTU - 1, function(value, status) {
		var sz = value.length;

		if (sz > (Constants.ATT_DEFAULT_MTU - 1)) {
			sz = Constants.ATT_DEFAULT_MTU - 1;
		}

		value = fromBufferToArray(value);

		var r = [Constants.ATT_OP_READ_RESP];
		r = r.concat(value);
		that.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r);
	});
	return 0;
}

ATTProtocolHandler.prototype.readByType = function(bc, data, dataIndex) {
	var type;

	var newDataIndex = dataIndex;

	if (data.length - dataIndex == 6) {
		type = utils.le16(data, dataIndex + 4);
	} else if (data.length - dataIndex == 20) {
		Logger.Log('NOT IMPLEMENTED!!!', Logger.ERROR);
		process.exit();		
		//type = uuid128_to_cuuid(data + 4);
		/*if (type == 0xffffffff) {
			goto notfound;
		}*/
	} else {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var start = utils.le16(data, dataIndex);
	var max = utils.le16(data, dataIndex + 2);

	if ((start < 1) || (start > max)) {
		return Constants.ATT_ERR_INVALID_HANDLE | (start << 8);
	}

	var a = null;

	for (;;) {
		if ((a = this.attributeDb.findAttributeByType(start, type)) == null) {
			break;
		}

		start = a.handle;
		if (start > max) {
			break;
		}

		var that = this;

		var attValue = this.attributeDb.getAttributeValue(a, 0, Constants.ATT_DEFAULT_MTU - 4, function(value, status) {
			var sz = value.length;
			var r = [];

			if (sz > (Constants.ATT_DEFAULT_MTU - 4)) {
				sz = Constants.ATT_DEFAULT_MTU - 4;
			}

			value = fromBufferToArray(value);

			r.push(Constants.ATT_OP_READ_BY_TYPE_RESP);
			r.push(sz + 2);
			r.push(start & 0xFF);
			r.push((start >> 8) & 0xFF);
			that.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r.concat(value));
		});
		return 0;
	}
	return (Constants.ATT_ERR_ATTR_NOT_FOUND | utils.le16(data, dataIndex) << 8);
}

function fromBufferToArray(buffer) {
	var array = [];

	var i = 0;

	for (; i < buffer.length; i++) {
		array.push(buffer[i]);
	}

	return array;
}

ATTProtocolHandler.prototype.readByGroupType = function(bc, data, dataIndex) {
	if (data.length - dataIndex != 6) {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var att;
	var start, end, max;
	var type;

	// TODO: do we need to handle client sending 128bit alts of 16bit UUIDs?
	// TODO: should probably return UNSUPPORTED_GROUP_TYPE for 128bit UUIDs
	start = utils.le16(data, dataIndex);
	max = utils.le16(data, dataIndex + 2);
	type = utils.le16(data, dataIndex + 4);

	if ((start < 1) || (start > max)) {
		return Constants.ATT_ERR_INVALID_HANDLE | (start << 8);
	}

	switch (type) {
		case AttributeDb.Constants.PRIMARY_SERVICE:
		case AttributeDb.Constants.SECONDARY_SERVICE:
		case AttributeDb.Constants.CHARACTERISTIC:
			break;
		default:
			return Constants.ATT_ERR_UNSUPPORTED_GROUP_TYPE | (start << 8);
	}

	for (;;) {
		if ((att = this.attributeDb.findAttributeByType(start, type)) == null) {
			break;
		}

		start = att.handle;
		if (start > max) {
			break;
		}

		end = this.attributeDb.findAttributeEnd(start, type);

		var that = this;
		var attValue = this.attributeDb.getAttributeValue(att, 0, Constants.ATT_DEFAULT_MTU - 6, function(value, status) {
			var sz = value.length;

			if (sz > (Constants.ATT_DEFAULT_MTU - 6)) {
				sz = Constants.ATT_DEFAULT_MTU - 6;
			}

			value = fromBufferToArray(value);

			var r = [];
			r.push(Constants.ATT_OP_READ_BY_GROUP_TYPE_RESP);
			r.push(sz + 4);
			r.push(start & 0xFF);
			r.push((start >> 8) & 0xFF);
			r.push(end & 0xFF);
			r.push((end >> 8) & 0xFF);
			that.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r.concat(value));
		});
		return 0;
	}
	return Constants.ATT_ERR_ATTR_NOT_FOUND | (utils.le16(data, dataIndex) << 8);
}

ATTProtocolHandler.prototype.readBlob = function(bc, data, dataIndex) {
	if (data.length - dataIndex != 4) {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var a;
	var handle;
	var offset;

	handle = utils.le16(data, dataIndex);
	dataIndex += 2;

	offset = utils.le16(data, dataIndex);
	dataIndex += 2;

	if ((a = this.attributeDb.findAttributeByHandle(handle)) == null) {
		return Constants.ATT_ERR_INVALID_HANDLE | (handle << 8);
	}

	var that = this;
	var attValue = this.attributeDb.getAttributeValue(a, offset, Constants.ATT_DEFAULT_MTU - 1, function(value, status) {
		var sz = value.length;

		if (sz > (Constants.ATT_DEFAULT_MTU - 1)) {
			sz = Constants.ATT_DEFAULT_MTU - 1;
		}

		value = fromBufferToArray(value);

		var r = [];
		r.push(Constants.ATT_OP_READ_BLOB_RESP);
		that.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r.concat(value));
	});

	return 0;
}

ATTProtocolHandler.prototype.write = function(bc, data, dataIndex) {
	if (data.length - dataIndex < 2) {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var handle = utils.le16(data, dataIndex);
	dataIndex += 2;

	if (this.attributeDb.setAttributeValue(bc, handle, data.slice(dataIndex)) == false) {
		return Constants.ATT_ERR_INVALID_HANDLE | (handle << 8);
	}

	var x = [Constants.ATT_OP_WRITE_RESP];
	this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, x);
	return 0;
}

ATTProtocolHandler.prototype.writePrepare = function(bc, data, dataIndex) {
	if (data.length - dataIndex < 4) {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var hnd = utils.le16(data, dataIndex);
	dataIndex += 2;

	var off = utils.le16(data, dataIndex);
	dataIndex += 2;

	if (this.attributeDb.findAttributeByHandle(hnd) == null) {
    	return Constants.ATT_ERR_INVALID_HANDLE | (hnd << 8);
  	}

  	if (this.queue_hnd && (this.queue_hnd != hnd)) {
		return Constants.ATT_ERR_PREPARE_QUEUE_FULL;
  	}

  	this.queue_data = Buffer.concat([this.queue_data, data.slice(dataIndex)]);
  	this.queue_hnd = hnd;

	var resp = [Constants.ATT_OP_PREPARE_WRITE_RESP];
	var retBufSrc = data.slice(dataIndex - 4);
	for (var i = 0; i < retBufSrc.length; i++) {
		resp.push(retBufSrc[i]);
	}
  	this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, resp);
  	return 0;
}

ATTProtocolHandler.prototype.writeExecute = function(bc, data, dataIndex) {
	if (data.length - dataIndex != 1) {
		Logger.Log('Error with write execute', Logger.ERROR);
		return Constants.ATT_ERR_INVALID_PDU;
	}

	if (data[dataIndex] & Constants.ATT_FLAGS_COMMIT) {
		if (this.queue_hnd != 0) {
			this.attributeDb.setAttributeValue(bc, this.queue_hnd, this.queue_data);
		}
	} else {
		Logger.Log('att: Write Cancel', Logger.ERROR);
	}

	/* clear queue */
	this.queue_hnd = 0;
    this.queue_data = new Buffer([]);

	/* ack */
	var res = [Constants.ATT_OP_EXEC_WRITE_RESP];
	this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, res);
	return 0;
}

ATTProtocolHandler.prototype.findInfo = function(bc, data, dataIndex) {
	if (data.length - dataIndex != 4) {
		return Constants.ATT_ERR_INVALID_PDU;
	}

	var r = [];
	var a;
	var sz;
	var startHandle, endHandle;

	startHandle = utils.le16(data, dataIndex);
	dataIndex += 2;

	endHandle = utils.le16(data, dataIndex);
	dataIndex += 2;

	if ((a = this.attributeDb.findAttributeByHandle(startHandle)) == null) {
		return Constants.ATT_ERR_INVALID_HANDLE | (startHandle << 8);
	}

	r.push(Constants.ATT_OP_FIND_INFO_RESP);
	r.push(0x01);
	r.push(startHandle & 0xFF);
	r.push((startHandle >> 8) & 0xFF);
	r.push(a.uuid & 0xFF);
	r.push(a.uuid >> 8);
	this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r);
	return 0;
}

ATTProtocolHandler.prototype.sendNotification = function(bc, handle) {
    var attr;

	if ((attr = this.attributeDb.findAttributeByHandle(handle)) == null) {
		return ERROR;
	}

	var attValue = fromBufferToArray(attr.value);

	var sz = attValue.length;

	if (sz > (Constants.ATT_DEFAULT_MTU - 3)) {
		sz = Constants.ATT_DEFAULT_MTU - 3;
	}

	var r = [Constants.ATT_OP_HANDLE_VALUE_NOTIFY, handle & 0xFF, (handle >> 8) & 0xFF];
	this.hciProtocolHandler.ble_write(bc, Constants.ATT_L2CAP_CH_ID, r.concat(attValue));
	return 0;
}

module.exports = {
	ATTProtocolHandler:ATTProtocolHandler,
	Constants:Constants
};
