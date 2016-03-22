var Utils = require('./Utils');
var Logger = require('./Logger');

/**
 This class is responsible for storing and exposing BLE Attributes
 1. All values are stored as Buffer object. This is a requirement and is checked across the code
 ***/

var Constants = {
	PRIMARY_SERVICE  :0x2800,
	SECONDARY_SERVICE:0x2801,
	INCLUDE			 :0x2802,
	CHARACTERISTIC 	 :0x2803,
	DEVICE_NAME		 :0x2A00,
	APPEARANCE		 :0x2A01,

	BROADCAST		   :0x01,
	READ 			   :0x02,
	WRITE_NO_RESPONSE  :0x04,
	WRITE 			   :0x08,
	NOTIFY 			   :0x10, // No confirmation back required
	INDICATE           :0x20, // Back confirmation required
	AUTH_SIGNED_WRITES :0x40,
	EXTENDED_PROPERTIES:0x80,

	// Primary services
	GAP: 0x1800,
	GATT:0x1801,

	// GATT Defined Descriptors
	CHARACTERISTIC_EXTENDED_PROPERTIES: 0x2900,
	CHARACTERISTIC_USER_DESCRIPTION:    0x2901,
	CLIENT_CHARACTERISTIC_CONFIGURATION:0x2902,

	// Descriptor bitfields
	CCC_NOTIFY    :0x0001,
	CCC_INDICATION:0x0002
}

function convertStringToArray(text) {
	return text.split('').map(function(e) { return e.charCodeAt() });
}

function convertUuidToArrayLE(uuid) {
	var valueArray = [];

	if (Utils.typeOf(uuid) === 'number') {
		if (uuid > 0 && uuid <= 0xFFFF) {
			// Short UUID
			valueArray.push(uuid & 0xFF);
			valueArray.push(uuid >> 8 & 0xFF);
		} else {
			return null;
		}
	} else if (Utils.typeOf(uuid) === 'array') {
		for (var i = uuid.length - 1; i >= 0; i--) {
			valueArray.push(uuid[i]);
		}
	} else {
		return null;
	}

	return valueArray;
}

// Compares 2 long UUIDs and returns 1 if they are equal and 0 otherwise
function sameUUID(uuid1, uuid2) {
	var type1 = Utils.typeOf(uuid1);
	var type2 = Utils.typeOf(uuid2);

	if (type1 !== type2) {
		return false;
	}

	if (type1 === 'number') {
		return uuid1 === uuid2;
	}

	if (uuid1.length != uuid2.length) {
		return false;
	}

	for (var i=0; i < uuid1.length; i++) {
		if (uuid1[i] != uuid2[i]) return false;
	}
	return true;
}

// The attribute Db stores all values as Buffer objects. Any other type of value
// will return false
function addEntry(attributes, handle, uuid, properties, value, readHandler, writeHandler) {
	if (handle < 0 || handle > 0xFFFF) {
		Logger.Log('Invalid handle while adding an entry: ' + handle, Logger.ERROR);

		return false;
	}

	if (value !== null && !(value instanceof Buffer)) {
		return false;
	}

	if (uuid < 0 || uuid > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) {
		Logger.Log('Invalid UUID');
		return false;
	}

	/*if (value == null) {
		value = [];
	}*/

	var entry = {
		handle: handle,
		uuid: uuid,
		properties: properties,
		value: value,
		writeHandler: writeHandler,
		readHandler: readHandler
	};

	attributes.push(entry);
	return true;
}

/* 
 * The Attribute Db is responsible for handling
 * BLE attributes. It connects to the PlaygroundBLE 
 * module over sockets/
 */
function AttributeDb() {
	this.mAttributes = [];
}

AttributeDb.prototype.setupDefaultAttributes = function(gapDeviceName) {
	// Add default attributes
	// GAP
	var deviceName = new Buffer(convertStringToArray(gapDeviceName));
	var appearance = new Buffer([0, 0]);

	this.addPrimaryService(Constants.GAP);
	this.addCharacteristic(Constants.DEVICE_NAME, Constants.READ | Constants.WRITE, deviceName); 	
	this.addCharacteristic(Constants.APPEARANCE, Constants.READ, appearance); 	

	// GATT
	this.addPrimaryService(Constants.GATT);
}

AttributeDb.prototype.addPrimaryService = function(uuid) {
	var valueArray = [];

	valueArray = convertUuidToArrayLE(uuid);

	if (valueArray == null) {
		return false;
	}

	return addEntry(this.mAttributes, this.mAttributes.length + 1, Constants.PRIMARY_SERVICE, null, new Buffer(valueArray), null, null);
}

// We probably can calculate the value length automatically. Will take care of it later so I can move on faster.
// Value has to be a byte array
AttributeDb.prototype.addCharacteristic = function(uuid, properties, value, readHandler, writeHandler) {
	// The value must by a Buffer
	if (value !== null && !(value instanceof Buffer)) {
		return false;
	}

	// Handle 0x0 is not valid, we need to start at 1
	var chrHandle = this.mAttributes.length + 1;
	var valueHandle = chrHandle + 1;
	var internalValue = [];

	// 1 byte
	internalValue.push(properties);

	// 2 bytes
	internalValue.push(valueHandle & 0xFF);
	internalValue.push(valueHandle >> 8 & 0xFF);		

	// 2 to 16 bytes
	var uuidArray = convertUuidToArrayLE(uuid);
	if (uuidArray == null) {
		return false;
	}
	internalValue = internalValue.concat(uuidArray);		

	if (addEntry(this.mAttributes, chrHandle, Constants.CHARACTERISTIC, null, new Buffer(internalValue), null, null) == false) {
		return false;
	}

	// Add now the Value Attribute
	if (addEntry(this.mAttributes, valueHandle, uuid, properties, value, readHandler, writeHandler) == false) {
		return false;
	}
	return true
}

AttributeDb.prototype.addClientConfigurationDescriptor = function(value) {
	// The value must by a Buffer
	if ( !(value instanceof Buffer)) {
		return false;
	}

	addEntry(this.mAttributes, this.mAttributes.length + 1, Constants.CLIENT_CHARACTERISTIC_CONFIGURATION, null, value, null, null);
}

AttributeDb.prototype.addCharacteristicUserDescription = function(text) {
	var finalArray = convertStringToArray(text);
	addEntry(this.mAttributes, this.mAttributes.length + 1, Constants.CHARACTERISTIC_USER_DESCRIPTION, null, new Buffer(finalArray));
}

AttributeDb.prototype.findAttributeByType = function(startHandle, type) {
	// The startHandle parameter is the starting handle, which is always arrayIndex - 1 (handle 0x0 is not valid)
	var startIndex = startHandle - 1;
	if (startIndex < 0) return null;

	for (var i = startIndex; i < this.mAttributes.length; i++) {
		if (this.mAttributes[i].uuid === type) {
			// handle = index + 1. index + 1 is the same as the handle for the selected attribute
			startHandle = i + 1;
			return this.mAttributes[i];	
		}
	}
	return null;
}

// Returns the handle for the last occurence of the specified attribute
// type. E.g. if we have PrimaryService with Handle=1, Characteristic with
// Handle=2, and then Primary Service with Handle=3, calling 
// findAttributeEnd(1, PRIMARY_SERVICE) will return 2 because is the last
// attribute that belongs to the first primary service
// Returns -1 in case of error
AttributeDb.prototype.findAttributeEnd = function(start, type) {
	var startIndex = start - 1;
	if (startIndex < 0) return -1;

	// Skip the current position
	var i = startIndex + 1;

	for (; i < this.mAttributes.length; i++) {
		if (this.mAttributes[i].uuid === type) {
			return this.mAttributes[i - 1].handle;
		}
	}

	// Got to the end of the DB. Return i instead of i - 1 because
	// we return the handle, not the array position
	return i;
}

AttributeDb.prototype.size = function() {
	return this.mAttributes.length;
}

AttributeDb.prototype.findAttributeByHandle = function(handle) {
	var i = 0;
	for (; i < this.mAttributes.length; i++) {
		if (this.mAttributes[i].handle === handle) {
			return this.mAttributes[i];
		}
	}
	return null;
}

AttributeDb.prototype.findAttributeByUUID = function(uuid) {
	var i = 0;
	for (; i < this.mAttributes.length; i++) {
		if (sameUUID(this.mAttributes[i].uuid, uuid)) {
			return this.mAttributes[i];
		}
	}
	return null;
}

function handleAttributeValueOffset(value, offset, maxLength, callback) {
	if (offset > value.length) {
		callback([], false);
	} else {
		var length = (value.length - offset) <= maxLength ? (value.length - offset) : maxLength;
		callback(value.slice(offset, offset + length), true);			
	}
}

AttributeDb.prototype.getAttributeValue = function(att, offset, maxLength, callback) {
	// Check if READ is allowed
	if (att.properties != null && ((att.properties & Constants.READ) == 0)) {
		//return false;
		callback([], false);
		return;
	}

	if (att.readHandler == null && att.value == null) {
		callback([], false);
		return;
	}


	if (att.readHandler != null) {
		att.readHandler(offset, att.uuid, function(value, status) {
			handleAttributeValueOffset(value, offset, maxLength, callback);
		});
		return;
	}

	handleAttributeValueOffset(att.value, offset, maxLength, callback);
}

AttributeDb.prototype.setAttributeValue = function(bc, handle, data) {
	if (data !== null && !(data instanceof Buffer)) {
		return false;
	}

	var att = this.findAttributeByHandle(handle);

	// Return false if WRITE is not allowed
	if ((att.properties != null) && ((att.properties & Constants.WRITE) == 0)) {
			return false;
	}

	if (att.uuid === Constants.PRIMARY_SERVICE || att.uuid === Constants.SECONDARY_SERVICE ||
		att.uuid === Constants.INCLUDE || att.uuid === Constants.CHARACTERISTIC) {
		return false;
	}

	att.value = data;

	if (att.writeHandler != null) {
		if (att.writeHandler(bc, att.uuid) != true) {
			Logger.Log('Error executing write handler for 0x' + att.handle, Logger.ERROR);
			return false;
		}
	}
	return true;
}

AttributeDb.prototype.printDB = function() {
	for (var i = 0; i < this.mAttributes.length; i++) {
		var entry = this.mAttributes[i];
		process.stdout.write('Handle: ' + entry.handle.toString(16) + ' UUID: ' + entry.uuid.toString(16) + ' Value: ');

		if (entry.value != null) {
			for (var j = 0; j < entry.value.length; j++) {
				process.stdout.write(entry.value[j].toString(16) + ' ');
			}
		}
		console.log('');
	}
}

module.exports = {
	AttributeDb:AttributeDb,
	Constants:Constants
};
