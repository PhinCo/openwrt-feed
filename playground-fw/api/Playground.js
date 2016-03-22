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

// Introspection Web Server
const PORT = 9408;
var server = http.createServer(handleRequest);
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost: " + PORT);
});

var	STATE_UUID = [0xC0, 0x0A, 0x20, 0x16, 0xF0, 0x11, 0xB3, 0x00, 0x38, 0x00, 0xB0, 0xCA, 0x00, 0x00, 0x00, 0x0B];
var	SSID_UUID = [0xC0, 0x0A, 0x20, 0x16, 0xF0, 0x11, 0xB3, 0x00, 0x38, 0x00, 0xB0, 0xCA, 0x00, 0x00, 0x00, 0x0C];
var	AUTH_UUID = [0xC0, 0x0A, 0x20, 0x16, 0xF0, 0x11, 0xB3, 0x00, 0x38, 0x00, 0xB0, 0xCA, 0x00, 0x00, 0x00, 0x0D];
var	KEY_UUID = [0xC0, 0x0A, 0x20, 0x16, 0xF0, 0x11, 0xB3, 0x00, 0x38, 0x00, 0xB0, 0xCA, 0x00, 0x00, 0x00, 0x0E];

function handleRequest(request, response){
	Components.playgroundCommandHandler.getInternalStatus(function(status, data) {
		// Get ssid, auth, key
		var state = PeripheralApi.getAttributeValue(STATE_UUID);
		var auth = PeripheralApi.getAttributeValue(AUTH_UUID);
		var ssid = PeripheralApi.getAttributeValue(SSID_UUID);
		var key = PeripheralApi.getAttributeValue(KEY_UUID);

		if (state !== null) state = state.toString().charCodeAt(0);
		if (auth !== null) auth = auth.toString();
		if (ssid !== null) ssid = ssid.toString();

		data.isAdvertising = Components.hciProtocolHandler.sIsAdvertising;
		data.shouldAdvertise = Components.hciProtocolHandler.sShouldAdvertise;
		data.connections = Components.connectionManager.connectionDb;

		var provisioning = {
			state:state,
			auth:auth,
			ssid:ssid,
			key:key
		};
		data.provisioning = provisioning;

		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(data));	
	});
}
// End of Introspection Web Server

// APIS //
var MasterApi = {
	scan: function(enable, callback) {
		Components.hciProtocolHandler.scan(enable, callback);
	}
}

var PeripheralApi = {
	enableAdvertising:function(advName, enable) {
		Components.hciProtocolHandler.sDeviceName = advName;
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