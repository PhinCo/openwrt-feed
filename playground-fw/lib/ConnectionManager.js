var Logger = require('./Logger');

const F_ACTIVE	= 1;
const F_DEAD	= 2;

// Time before we terminate inactive connections
const CONNECTION_TIMEOUT = 10000;

function ConnectionManager() {
	// List of dependencies
	this.hciProtocolHandler = null;
	// End of list of dependencies

	// List of connections
	this.connectionDb = {};
}

function inactivityHandler(that, bc) {
	Logger.Log('INACTIVITY HANDLER: ' + bc.info.handle.toString(16) + ' (Active: ' + (bc.flags & F_ACTIVE) + ')', Logger.DEBUG);

	if (Date.now() - bc.lastAccess > CONNECTION_TIMEOUT) {
		Logger.Log('Connection inactive for a long time.', Logger.DEBUG);
		if (bc.flags & F_ACTIVE) {
			Logger.Log('Disconnecting!!', Logger.DEBUG);
			//that.disconnectConnection(bc, bc.info.handle);
			that.hciProtocolHandler.setup();
			that.hciProtocolHandler.enableAdvertising(true);
		}
	} else {
		setTimeout(function() {
			inactivityHandler(that, bc);
		}, CONNECTION_TIMEOUT);
	}
}

ConnectionManager.prototype.bleConnectionCallback = function(bc, status) {
	Logger.Log('Connection Callback: Handle: ' + bc.info.handle + ' Status: ' + status, Logger.DEBUG + ' sShouldAdvertise: ' + this.hciProtocolHandler.sShouldAdvertise);

	if (status == 1 && this.hciProtocolHandler.sShouldAdvertise) {
		Logger.Log('BLE Connection Callback: Enable Advertising');
		this.hciProtocolHandler.enableAdvertising(true);
	}

	// Watchdog to terminate inactive connections
/*	var that = this;
	if (status == 0) {
		Logger.Log('Connection Callback: Set Timeout ' + bc.info.handle, Logger.DEBUG);

		setTimeout(function() {
			inactivityHandler(that, bc);
		}, CONNECTION_TIMEOUT);
	}*/

	return true;
}

ConnectionManager.prototype.updateLastRequestAccess = function(handle) {
	var entry = this.connectionDb[handle];

	if (entry === undefined) {
		return;
	}

	entry.lastAccess = Date.now();
}

ConnectionManager.prototype.addConnection = function(handle, bc) {
	this.connectionDb[handle] = bc;
	this.updateLastRequestAccess(handle);
}

ConnectionManager.prototype.findConnectionHandle = function(handle, mask) {
	var entry = this.connectionDb[handle];

	if (entry === undefined) return null;
	if (entry.flags & mask) return entry;
	return null;
}

ConnectionManager.prototype.disconnectConnection = function(bc, handle) {
	bc.flags &= (~F_ACTIVE);
	bc.flags |= F_DEAD;

	Logger.Log('Request to disconnect connection: '  + handle.toString(16));
	this.bleConnectionCallback(bc, 1);
}

module.exports = {
	ConnectionManager:ConnectionManager
}