var ATT_DB = require('./../lib/AttributeDb');
var Utils = require('./../lib/Utils');
var Playground = require('./../api/Playground');
var Log = require('./../lib/Logger');

var States = {
	UNPROVISIONED:0,
	WIFI_PENDING:1,
	WIFI_CONNECTED:2,
	WIFI_ERROR:3,
	COPACETIC:4,
	PROVISIONING_ERROR:5,	
}

var Constants = {
	INITIAL_NETWORK_WAIT:5000,
	PERIODIC_NETWORK_WAIT:3000,
	MAX_NW_ATTEMPTS:8
}

var AttributeUUIDs = {}

const PLAYGROUND_BRIDGE_DEFAULT_GAP_NAME = 'PlaygroundRedBridge';

function _setupAttributeUUID(UUIDPrefix) {
	// Bridge Provisioning Service
	AttributeUUIDs.PROVISIONING_SERVICE_UUID = UUIDPrefix.concat([0x00, 0x00]);
	// Provisioning Characteristics
	AttributeUUIDs.SSIDS_UUIDS = [
					UUIDPrefix.concat([0x00, 0x01]),
					UUIDPrefix.concat([0x00, 0x02]),
					UUIDPrefix.concat([0x00, 0x03]),
					UUIDPrefix.concat([0x00, 0x04]),
					UUIDPrefix.concat([0x00, 0x05]),
					UUIDPrefix.concat([0x00, 0x06]),
					UUIDPrefix.concat([0x00, 0x07]),
					UUIDPrefix.concat([0x00, 0x08]),
					UUIDPrefix.concat([0x00, 0x09]),
					UUIDPrefix.concat([0x00, 0x0A])
				],

	AttributeUUIDs.STATE_UUID = UUIDPrefix.concat([0x00, 0x0B]);
	AttributeUUIDs.SSID_UUID =	UUIDPrefix.concat([0x00, 0x0C]);
	AttributeUUIDs.AUTH_UUID = UUIDPrefix.concat([0x00, 0x0D]);
	AttributeUUIDs.KEY_UUID = UUIDPrefix.concat([0x00, 0x0E]);

	// Required for secret key establishment (ECDH)
	AttributeUUIDs.BRIDGE_PUB_KEY_UUID = UUIDPrefix.concat([0x00, 0x0F]);
	AttributeUUIDs.PHONE_PUB_KEY_UUID = UUIDPrefix.concat([0x00, 0x10]);
}


function setupWiFiSecurity(ssid, auth, key) {
	var keyStr = '';
	var authStr = '';
	var ssidStr = '\'' + ssid + '\'';

	if (key != null && key.length > 0) {
		authStr = 'option encryption \'' + auth + '\'';
		keyStr = 'option key \'' + key + '\'';
	} else {
		authStr = 'option encryption \'none\'';
	}

	Utils.generateWifiConfigFile(ssidStr, authStr, keyStr, function() {
		Utils.cmd_system('wifi');	
	});
}

function setupWPA(ssid, key) {
	setupWiFiSecurity(ssid, "psk", key);
}

function setupWPA2(ssid, key) {
	setupWiFiSecurity(ssid, "psk2", key);
}

function setupWEP(ssid, key) {
	var keyStr = '';
	var authStr = '';
	var ssidStr = '\'' + ssid + '\'';

	if (key != null && key.length > 0) {
		authStr = 'option encryption \'wep\'';
		keyStr = 'option key1 \'' + key + '\'\n\t\toption key=1';
	} else {
		authStr = 'option encryption \'none\'';
	}

	Utils.generateWifiConfigFile(ssidStr, authStr, keyStr, function() {
		Utils.cmd_system('wifi');	
	});
}

function checkNetworkInternal(callback) {
	Utils.execCommand('ping www.google.com -w 2', function(text) {
		callback(text.indexOf('bytes from') !== -1);
	});
}

function checkNetworkWrapper(thisService, bc, networkAttempts) {
	checkNetworkInternal(function(available) {
		if (available) {
			thisService.setStateAttributeValue(States.WIFI_CONNECTED);
			thisService.notifyStateChange(bc);
		} else {
			if (networkAttempts < Constants.MAX_NW_ATTEMPTS) {
				setTimeout(function() {
					checkNetworkWrapper(thisService, bc, networkAttempts + 1)
				}, Constants.PERIODIC_NETWORK_WAIT);					
			} else {
				thisService.setStateAttributeValue(States.WIFI_ERROR);
				thisService.notifyStateChange(bc);
			}
		}
	});
}	

function checkNetwork(thisService, bc) {
	setTimeout(function() {
		checkNetworkWrapper(thisService, bc, 0);
	}, Constants.INITIAL_NETWORK_WAIT);
}

// UUIDPrefix is a valid 14 byte UUID that PlaygroundBridgeProvisioning
// uses with its primary service and characteristics. We ask for 14 bytes
// instead of 16 (128 bits) so we can automatically create the UUIDs for 
// all the characteristics by appending a 2 byte suffix
function PlaygroundBridgeProvisioning(advertisementName, fullDeviceName, UUIDPrefix) {
	if (UUIDPrefix === undefined || UUIDPrefix === null) {
		throw new Error("You must provide a 14 byte unique valid BLE UUID");
	} 

	_setupAttributeUUID(UUIDPrefix);

	if (fullDeviceName === undefined || fullDeviceName === null) {
		throw new Error('You must provide the full device name');
	}

	this.parseNetworkInfo = function(str) {
		if (str === undefined || str.length == 0) {
			return [];
		}

		var out = str.replace(/^\s+/mg, '');
		out = out.split('\n');
		var cells = [];
		var line;
		var info = {};

		var mac = /^Cell \d+ - Address: (.*)/;
		var fields = {
	        //'mac' : /^Cell \d+ - Address: (.*)/,
	        's' : /^ESSID:"(.*)"/,
	        //'channel': /^Channel:(.*)/,
	        // 'protocol' : /^Protocol:(.*)/,
	        // 'mode' : /^Mode:(.*)/,
	        // 'frequency' : /^Frequency:(.*)/,
	        'e' : /IEEE 802.11.*\/(\w*)\s/,
	        // 'bitrates' : /Bit Rates:(.*)/,
	        // 'quality' : /Quality(?:=|\:)([^\s]+)/,
	        'r' : /Signal level(?:=|\:)([-\w]+)/
	    };

	    var collisions = {};

	    for (var i=0,l=out.length; i<l; i++) {
	    	line = out[i].trim();

	    	if (!line.length) {
	    		continue;
	    	}
	    	if (line.match("Scan completed :")) {
	    		continue;
	    	}
	    	if (line.match("Interface doesn't support scanning.")) {
	    		continue;
	    	}

	    	if (line.match(mac)) {
	    		if (info.s !== undefined && collisions[info.s] === undefined && info.s.length > 0) {
	    			collisions[info.s] = 1;
	    			cells.push(info);
	    		} else {
	    			continue;
	    		}
	    		info = {};
	    	}

	    	for (var field in fields) {
	    		if (line.match(fields[field])) {
	    			info[field] = (fields[field].exec(line)[1]).trim();
	    		}
	    	}
	    }

	    if (info.s !== undefined && collisions[info.s] === undefined && info.s.length > 0) {
	    	cells.push(info);
	    }

	    cells = cells.sort(function(a, b) {                                                                     
	    	return b.r - a.r;
	    });

	    return cells;
	}
	
	this.readSSIDs = function(callback, readSSIDAttempts) {
		var me = this;
		me.stdout = '';
		Utils.execCommand('iwlist wlan0 scanning', function(text) {
			if ((text === undefined || text.length == 0) && readSSIDAttempts < 15) {
				setTimeout( function() {	
					readSSIDs(callback, readSSIDAttempts + 1);
				}, 1000);
			} else {
				callback(text); 
			}
		});
	}

	// Declaring function in this way so I can test it
	// callback(value, status)
	this.handleLongResponse = function(entries) {
	    var finalSize = 0;
	    for (var i = 0; i < entries.length; i++) {
	    	delete entries[i].r;
	    }

	    var entriesStr = JSON.stringify(entries);
	    var value = entriesStr.split('').map(function(e) { return e.charCodeAt() });

	    var segments = [];
	    var k = 0;
	    var slice = null;

	    var retBool = true;

	    while (k < AttributeUUIDs.SSIDS_UUIDS.length) {
	    	if (value.length > 512) {
		    	slice = value.slice(0,512);

		    	if (k == AttributeUUIDs.SSIDS_UUIDS.length - 1) {
		    		if (slice.length == 512) {
		    			//remove some final characters until reaching }
		    			//start at length - 2 in case the last character happens
		    			//to be }. We need space to store the end of the array ]
		    			var p = 510;
		    			while(slice[p] != "}".charCodeAt(0)) {
		    				p--;
		    			}
		    			slice[p+1] = "]".charCodeAt(0);
		    			slice = slice.slice(0, p+2);
		    		}
		    	}
		    	var buffer = new Buffer(slice);
		    	segments.push(buffer);
		    	retBool = retBool && Playground.PeripheralApi.setAttributeValue(AttributeUUIDs.SSIDS_UUIDS[k++], buffer);
		    	value = value.slice(512);
		    } else {
		    	var buffer = new Buffer(value);
		    	retBool = retBool && Playground.PeripheralApi.setAttributeValue(AttributeUUIDs.SSIDS_UUIDS[k], buffer);
		    	segments.push(buffer);
		    	break;
		    }
	    }

		var result = [segments, retBool];	    
	    return result;
	}

	///////////// HANDLERS //////////////////////////////////////////////////////////////////
	this.readSSIDsHandler = function(offset, characteristicUuid, callback) {
		var currentValue = Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.SSIDS_UUIDS[0]);

		if (currentValue != null && (offset != 0)) {
			callback(currentValue, true);
			return;
		}

		var that = this;
		this.readSSIDs( function(text) { 
			var entries = [];                                                                                           
		    // Use the map to avoid duplicates
		    var collisions = {};

		    entries = that.parseNetworkInfo(text);
		    var result = that.handleLongResponse(entries, callback);

		    callback(result[0][0], result[1]);
		    //that.storeSsidsInAttributes(jsonPieces, callback);

		}, 0);
	}

    // When calling this method make sure you have written auth and key before. These are required by the method to setup the
    // network properly
    this.writeSSIDKeyHandler = function(bc, characteristicUuid) {
    	var ssid = Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.SSID_UUID);
    	var auth = Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.AUTH_UUID);
		var key = Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.KEY_UUID);

		if (ssid === null || auth === null || key === null) {
			Log.Log('WriteSSIDHandler missing a variable: SSID, AUTH, KEY', Log.DEBUG);
			Log.Log(ssid);
			Log.Log(auth);
			Log.Log(key);
			this.setStateAttributeValue(States.WIFI_ERROR);
			this.notifyStateChange(bc);
			return false;
		}

		var that = this;
		Playground.CryptoApi.aesDecrypt(key, function(status, plainText) {
			if (status == false) {
		 		Log.Log('Error decrypting the key', Log.DEBUG);
		 		return;
		 	}
			
			// Switch to WIFI_PENDING
			if (that.setStateAttributeValue(States.WIFI_PENDING) == false) {
				Log.Log('Error setting the WIFI state value to WIFI_PENDING', Log.ERROR);
			}

			// Use the AUTH string to decide what type of setup to use: WPA or WPA2
			var authStr = auth.toString().toLowerCase();
			if (authStr === 'none') {
				Log.Log('SETTING UP NO SECURITY: ' + ssid, Log.DEBUG);
				setupWiFiSecurity(ssid, authStr, null);
			} else if (authStr == 'wpa') {
				Log.Log('SETTING UP WPA: ' + ssid, Log.DEBUG);
				setupWPA(ssid, plainText);
			} else if (authStr == 'wpa2') {
				Log.Log('SETTING UP WPA2: ' + ssid, Log.DEBUG);
				setupWPA2(ssid, plainText);	        	
			} else if (authStr == 'wep') {
				Log.Log('SETTING UP WEP: ' + ssid, Log.DEBUG);
				setupWEP(ssid, plainText);
			}
			checkNetwork(that, bc);
		});
		return true;
	}

	this.readBridgePubKeyHandler = function(offset, characteristicUuid, callback) {
		callback(Playground.CryptoApi.getPublicKey(null), true);
	}

	this.writePhonePublicKeyHandler = function(bc, characteristicUuid) {
		var state = this.getStateAttributeValue();
		if (state === undefined || state === null) {
			Log.Log('Error reading the state');
			return false;
		}

		if (state[0] == States.COPACETIC) {
			Log.Log('Trying to write the phone public key after the bridge has been initialized', Log.DEBUG);
			return false;
		}

		var pubKey = Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.PHONE_PUB_KEY_UUID);

		Playground.CryptoApi.deriveSecret(pubKey, function(status) {});

		return true;
	}
	// END OF HANDLERS //////////////////////////////////////////////////////////////////
	this.fullDeviceName = fullDeviceName;
	this.advertisementName = advertisementName;

	this.setupServices(fullDeviceName);
}

PlaygroundBridgeProvisioning.prototype.startAdvertising = function() {
	Playground.PeripheralApi.enableAdvertising(this.advertisementName, AttributeUUIDs.PROVISIONING_SERVICE_UUID, true);
}

PlaygroundBridgeProvisioning.prototype.stopAdvertising = function() {
	Playground.PeripheralApi.enableAdvertising(this.advertisementName, AttributeUUIDs.PROVISIONING_SERVICE_UUID, false);
}

PlaygroundBridgeProvisioning.prototype.setupServices = function(gapDeviceName) {
	var state = States.UNPROVISIONED;


	Playground.PeripheralApi.setupDefaultAttributes(gapDeviceName);

	// Primary Service
	Playground.PeripheralApi.addPrimaryService(AttributeUUIDs.PROVISIONING_SERVICE_UUID);

	// The list of networks can be long. The limit for an attribute value length is 512. We use multiple characteristics
	// and split the data across them. In order to read it, start with CHR1. If the length of the value is 512, read the next
	// one. If empty, it means there is no more data. Otherwise stitch data and keep reading.
	// SSIDs
	var i = 0;
	for (; i < AttributeUUIDs.SSIDS_UUIDS.length; i++) {
		Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.SSIDS_UUIDS[i], ATT_DB.Constants.READ, null, (i == 0 ? this.readSSIDsHandler.bind(this) : null), null);
		Playground.PeripheralApi.addCharacteristicUserDescription("List of networks part " + (i + 1));
	}
		
	// State
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.STATE_UUID, ATT_DB.Constants.READ | ATT_DB.Constants.NOTIFY, new Buffer([state]), null, null);
	Playground.PeripheralApi.addCharacteristicUserDescription("Setup status");
	Playground.PeripheralApi.addClientConfigurationDescriptor(new Buffer([ATT_DB.Constants.CCC_NOTIFY]));

	// SSID
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.SSID_UUID, ATT_DB.Constants.WRITE, null, null, null);
	Playground.PeripheralApi.addCharacteristicUserDescription("Selected SSID");

	// Auth
	// After setup make this characteristic read only.
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.AUTH_UUID, ATT_DB.Constants.WRITE, null, null, null);
	Playground.PeripheralApi.addCharacteristicUserDescription("SSID Auth");

	// Key
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.KEY_UUID, ATT_DB.Constants.WRITE, null, null, this.writeSSIDKeyHandler.bind(this));
	Playground.PeripheralApi.addCharacteristicUserDescription("SSID Key");

	// Bridge Pub Key
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.BRIDGE_PUB_KEY_UUID, ATT_DB.Constants.READ, null, this.readBridgePubKeyHandler.bind(this), null);
	Playground.PeripheralApi.addCharacteristicUserDescription("Bridge pub key");

	// Phone Pub Key
	Playground.PeripheralApi.addCharacteristic(AttributeUUIDs.PHONE_PUB_KEY_UUID, ATT_DB.Constants.WRITE, null, null, this.writePhonePublicKeyHandler.bind(this));
	Playground.PeripheralApi.addCharacteristicUserDescription("Phone pub key");

	//Playground.Components.attributeDb.printDB();
}

PlaygroundBridgeProvisioning.prototype.getStateAttributeValue = function() {
	return Playground.PeripheralApi.getAttributeValue(AttributeUUIDs.STATE_UUID);
}

PlaygroundBridgeProvisioning.prototype.setStateAttributeValue = function(value) {
	var array = [value];
	return Playground.PeripheralApi.setAttributeValue(AttributeUUIDs.STATE_UUID, new Buffer(array));
}

PlaygroundBridgeProvisioning.prototype.notifyStateChange = function(bc) {
	return Playground.PeripheralApi.sendNotification(bc, AttributeUUIDs.STATE_UUID);
}

PlaygroundBridgeProvisioning.prototype.finishProvisioningSuccess = function() {
	this.setStateAttributeValue(States.COPACETIC);
}

PlaygroundBridgeProvisioning.prototype.finishProvisioningError = function() {
	this.setStateAttributeValue(States.BINDING_ERROR);
}

PlaygroundBridgeProvisioning.prototype.addProvisioningCharacteristic = function(uuid, description, permission, value, readHandler, writeHandler) {
	Playground.PeripheralApi.addCharacteristic(uuid, permission, value, readHandler, writeHandler);
	Playground.PeripheralApi.addCharacteristicUserDescription(description);
}

module.exports = {
	PlaygroundBridgeProvisioning:PlaygroundBridgeProvisioning,

	// Constants
	States:States,
	AttributeUUIDs:AttributeUUIDs,
	Constants:Constants
}
