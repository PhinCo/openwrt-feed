var Utils = require('./../lib/Utils');
var SharedState = require('./../lib/SharedState');
var HCIProtocolHandler = require('./../lib/HCIProtocolHandler');
var BTCtrlrLoopbackTCPAdapter = require('./../lib/BTCtrlrLoopbackTCPAdapter');
var GAPProtocolHandler = require('./../lib/GAPProtocolHandler');
var ATTProtocolHandler = require('./../lib/ATTProtocolHandler');
var AttributeDb = require('./../lib/AttributeDb');
var CommandQueueManager = require('./../lib/CommandQueueManager');
var ConnectionManager = require('./../lib/ConnectionManager');
var PlaygroundCommandHandler = require('./../lib/PlaygroundCommandHandler');
var http = require('http');

// Create Components
var Components = {
	hciProtocolHandler: 		new HCIProtocolHandler.HCIProtocolHandler(),
	btCtrlrLocalhostTcpAdapter: new BTCtrlrLoopbackTCPAdapter.BTCtrlrLoopbackTCPAdapter(),
	gapProtocolHandler: 		new GAPProtocolHandler.GAPProtocolHandler(),
	attProtocolHandler: 		new ATTProtocolHandler.ATTProtocolHandler(),
	attributeDb: 				new AttributeDb.AttributeDb(),
	playgroundCommandHandler: 	new PlaygroundCommandHandler.PlaygroundCommandHandler(),
	commandQueueManager: 		new CommandQueueManager.CommandQueueManager(),
	connectionManager: 			new ConnectionManager.ConnectionManager()
}

// Setup dependencies
Components.hciProtocolHandler.gapProtocolHandler 				= Components.gapProtocolHandler;
Components.hciProtocolHandler.attProtocolHandler 				= Components.attProtocolHandler;
Components.hciProtocolHandler.btCtrlrAdapter 					= Components.btCtrlrLocalhostTcpAdapter;
Components.hciProtocolHandler.commandQueueManager 				= Components.commandQueueManager;
Components.hciProtocolHandler.connectionManager 				= Components.connectionManager;

Components.btCtrlrLocalhostTcpAdapter.hciProtocolHandler 		= Components.hciProtocolHandler;
Components.btCtrlrLocalhostTcpAdapter.playgroundCommandHandler 	= Components.playgroundCommandHandler;
Components.btCtrlrLocalhostTcpAdapter.commandQueueManager 		= Components.commandQueueManager;


Components.attProtocolHandler.hciProtocolHandler 				= Components.hciProtocolHandler;
Components.attProtocolHandler.attributeDb 						= Components.attributeDb;

Components.playgroundCommandHandler.hciProtocolHandler 			= Components.hciProtocolHandler;
Components.playgroundCommandHandler.commandQueueManager 		= Components.commandQueueManager;

Components.commandQueueManager.btCtrlrAdapter 					= Components.btCtrlrLocalhostTcpAdapter;

Components.connectionManager.hciProtocolHandler 				= Components.hciProtocolHandler;
// End of dependency setup

// Initializations
Components.hciProtocolHandler.setup();
Components.playgroundCommandHandler.generateKeyPair();
if (SharedState.getValue('autoConnect') === true) {
	Components.btCtrlrLocalhostTcpAdapter.connect(function(status) {
		// In case of connection error, the process will exit nothing to do here
	});
}
// End of initializations

// APIS //
var MasterApi = {
	scan: function(enable, callback) {
		Components.hciProtocolHandler.scan(enable, callback);
	}
}

var PeripheralApi = {
	enableAdvertising:function(advName, uuid, enable) {
		Components.hciProtocolHandler.sDeviceName = advName;
		Components.hciProtocolHandler.sServiceUUID = uuid;
		Components.hciProtocolHandler.enableAdvertising(enable);
	},

	isAdvertising:function() {
		return Components.hciProtocolHandler.sIsAdvertising;
	},

	// This method accesses the attribute directly and bypasses
	// handlers and permissions. This is used by local code to
	// manipulate the attribute. For remote requests, HCIProtocolHandler
	// uses the AttributeDb API, which enforces all required policies
	setAttributeValue:function(uuid, value) {
		var attr = Components.attributeDb.findAttributeByUUID(uuid);
		if (attr === null || attr === undefined) {
			return false;
		}

		if (value !== null && !(value instanceof Buffer)) {
			return false;
		}

		attr.value = value;
		return true;
	},


	// This method accesses the attribute directly and bypasses
	// handlers and permissions. This is used by local code to
	// manipulate the attribute. For remote requests, HCIProtocolHandler
	// uses the AttributeDb API, which enforces all required policies
	getAttributeValue:function(uuid) {
		var attr = Components.attributeDb.findAttributeByUUID(uuid);
		if (attr == null) {
			return null;
		}

		return attr.value;
	},

	sendNotification:function(connection, uuid) {
		var attr = Components.attributeDb.findAttributeByUUID(uuid);
		if (attr == null) {
			return false;
		}
		return Components.attProtocolHandler.sendNotification(connection, attr.handle);
	},	

	setupDefaultAttributes:function(deviceName) {
		Components.attributeDb.setupDefaultAttributes(deviceName);
	},

	addPrimaryService: function(UUID) {
		Components.attributeDb.addPrimaryService(UUID);
	},

	addCharacteristic: function(uuid, properties, value, readHandler, writeHandler) {
		Components.attributeDb.addCharacteristic(uuid, properties, value, readHandler, writeHandler);
	},

	addCharacteristicUserDescription: function(text) {
		Components.attributeDb.addCharacteristicUserDescription(text);
	},

	addClientConfigurationDescriptor: function(value) {
		Components.attributeDb.addClientConfigurationDescriptor(value);
	}	
}

var CryptoApi = {
	aesDecrypt: function(data, callback) {
		Components.playgroundCommandHandler.aesDecrypt(data, callback);
	},

	pubKeyDecrypt: function(pubKey, data, callback) {
		Components.playgroundCommandHandler.pubKeyDecrypt(pubKey, data, callback);
	},

	getPublicKey: function(connection) {
		return Components.playgroundCommandHandler.pubKey;
	},

	deriveSecret: function(pubKey, callback) {
		Components.playgroundCommandHandler.deriveSecret(pubKey, callback);
	}
}
// END OF APIS //

// Constants //
var Constants = {
	CHARACTERISTIC_WRITE:AttributeDb.Constants.WRITE,
	CHARACTERISTIC_READ:AttributeDb.Constants.READ
}

module.exports = {
	// Functions
	MasterApi: MasterApi,
	PeripheralApi: PeripheralApi,
	CryptoApi: CryptoApi,

	// Components
	Components: Components,

 	// Constants
 	Constants: Constants
 }