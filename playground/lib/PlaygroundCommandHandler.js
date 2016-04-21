var Logger = require('./Logger');

const HCI_BRIDGE_OK					= 0;
const HCI_BRIDGE_ERROR 				= 1;
const PLAYGROUND_INTERNAL_COMMAND	= 0x08;
// List of internal commands
const PG_CREATE_KEY_PAIR				= 0x01;
const PG_GET_PUB_KEY				= 0x02;
const PG_DERIVE_SECRET				= 0x03;
const PG_AES_ENCRYPT				= 0x04;
const PG_AES_DECRYPT				= 0x05;
const PG_PUBKEY_DECRYPT				= 0x06;
const PG_INTERNAL_STATUS			= 0x07;
// End of list of internal commands

//const ERROR 						= -1;

function PlaygroundCommandHandler() {
	//Dependencies
	this.hciProtocolHandler = null;
	this.commandQueueManager = null;
	//End of dependencies

	this.pubKey = null;
}

PlaygroundCommandHandler.prototype.onCommand = function(data) {
	Logger.Log('OnPlaygroundCommand:', Logger.HCI_LOGS);
	Logger.Log(data, Logger.HCI_LOGS);
	this.handleResponse(data);
	this.commandQueueManager.resetLastCommandSent();
	this.commandQueueManager.sendNextCommand();
}

PlaygroundCommandHandler.prototype.handleResponse = function(data) {
	var status = data[0];
	var command = data[1];

	if (status == HCI_BRIDGE_ERROR) {
		if (this.commandQueueManager.pendingOperationCallback != null) {
			this.commandQueueManager.pendingOperationCallback(false);
		}
		return;
	} 

	switch (command) {
		case PG_CREATE_KEY_PAIR:
			this.pubKey = [];
			var pubk = data.slice(2);
			for (var i = 0; i < pubk.length; i++) {
				this.pubKey.push(pubk[i]);
			}

			if (this.commandQueueManager.pendingOperationCallback != null) {
				this.commandQueueManager.pendingOperationCallback(true, data.slice(2));
			}
			break;
		case PG_AES_DECRYPT:
			if (this.commandQueueManager.pendingOperationCallback != null) {
				this.commandQueueManager.pendingOperationCallback(true, data.slice(2));
			}
			break;
		case PG_PUBKEY_DECRYPT:
			if (this.commandQueueManager.pendingOperationCallback != null) {
				this.commandQueueManager.pendingOperationCallback(true, data.slice(2));
			}
			break;
		case PG_DERIVE_SECRET:
			if (this.commandQueueManager.pendingOperationCallback != null) {
				this.commandQueueManager.pendingOperationCallback(true);
			}
			break;
		case PG_INTERNAL_STATUS:
			if (this.commandQueueManager.pendingOperationCallback != null) {
				var jsonStr = data.slice(2).toString();
				try {
					var json = JSON.parse(jsonStr);
				} catch(error) {
					Logger.Log('Error parsing INTERNAL STATUS data', Logger.ERROR);
				}
				this.commandQueueManager.pendingOperationCallback(true, json);
			}
			break;
		case PG_AES_ENCRYPT:
		case PG_GET_PUB_KEY:
			break;
	default:
			Logger.Log('unknown playground command: ' + command, Logger.ERROR);
	}
}

PlaygroundCommandHandler.prototype.sendPlaygroundCommand = function(cmd, data, callback) {
	var d = [PLAYGROUND_INTERNAL_COMMAND, cmd];

	if (data == null) {
		d.push(0);
	} else {
		d.push((data.length >> 8) & 0xFF);
		d.push(data.length & 0xFF);
	}

    if (data) {
    	for (var i = 0; i < data.length; i++) {
            d.push(data[i]);
    	}
    }


    var buf = new Buffer([(d.length >> 8) & 0xFF, d.length & 0xFF].concat(d));
    Logger.Log('SENDING PLAYGROUND_COMMAND', Logger.HCI_LOGS);
    Logger.Log(buf, Logger.HCI_LOGS);
	this.commandQueueManager.queue(cmd, buf, callback);
	this.commandQueueManager.sendNextCommand();	
}

PlaygroundCommandHandler.prototype.generateKeyPair = function(callback) {
	this.sendPlaygroundCommand(PG_CREATE_KEY_PAIR, null, callback);
}

PlaygroundCommandHandler.prototype.aesDecrypt = function(data, callback) {
	if (data === null) {
		callback(true, data);
		return;
	}

	this.sendPlaygroundCommand(PG_AES_DECRYPT, data, callback);
}

PlaygroundCommandHandler.prototype.pubKeyDecrypt = function(pubKey, data, callback) {
	if (data === null) {
		callback(true, data);
		return;
	}

	if (pubKey === null) {
		callback(false);
		return;
	}

	// Store the pubKey
	var d = [];
	d.push((pubKey.length >> 8) & 0xFF);
	d.push(pubKey.length & 0xFF);
	for (var i = 0; i < pubKey.length; i++) {
        d.push(pubKey[i]);
	}

	// Store the data
	d.push((data.length >> 8) & 0xFF);
	d.push(data.length & 0xFF);
	for (var i = 0; i < data.length; i++) {
        d.push(data[i]);
	}
	this.sendPlaygroundCommand(PG_PUBKEY_DECRYPT, d, callback);
}

PlaygroundCommandHandler.prototype.deriveSecret = function(peerPubKey, callback) {
	this.sendPlaygroundCommand(PG_DERIVE_SECRET, peerPubKey, callback);
}

PlaygroundCommandHandler.prototype.getInternalStatus = function(callback) {
	this.sendPlaygroundCommand(PG_INTERNAL_STATUS, null, callback);
}

module.exports = {
	PlaygroundCommandHandler:PlaygroundCommandHandler
};
