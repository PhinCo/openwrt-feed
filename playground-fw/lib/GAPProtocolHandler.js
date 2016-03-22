var utils = require('./Utils');

function GAPProtocolHandler() {
	this.discoveries = {};
}

GAPProtocolHandler.prototype.parseGAPData = function(type, address, addressType, eir, rssi) {
	var previouslyDiscovered = !!this.discoveries[address];

	var i = 0;
	var j = 0;
	var serviceUuid = null;
		var advertisement = previouslyDiscovered ? this.discoveries[address].advertisement : {		
		localName: undefined,
		txPowerLevel: undefined,
		manufacturerData: undefined,
		serviceData: [],
		serviceUuids: []
	};

	var discoveryCount = previouslyDiscovered ? this.discoveries[address].count : 0;
		var hasScanResponse = previouslyDiscovered ? this.discoveries[address].hasScanResponse : false;

 	if (type === 0x04) {
	 	hasScanResponse = true;
		} else {
 		// reset service data every non-scan response event
 		advertisement.serviceData = [];
 		advertisement.serviceUuids = [];
	}

	discoveryCount++;

	while ((i + 1) < eir.length) {
		var length = eir[i];

	    if (length < 1) {
	      	break;
	    }

	    var eirType = eir[i + 1]; // https://www.bluetooth.org/en-us/specification/assigned-numbers/generic-access-profile

	    if ((i + length + 1) > eir.length) {
  			console.log('invalid EIR data, out of range of buffer length');
  			break;
		}

	    var bytes = eir.slice(i + 2).slice(0, length - 1);

		switch(eirType) {
			case 0x02: // Incomplete List of 16-bit Service Class UUID
		  	case 0x03: // Complete List of 16-bit Service Class UUIDs
				for (j = 0; j < bytes.length; j += 2) {
					serviceUuid = utils.le16(bytes, j).toString(16);
				  	if (advertisement.serviceUuids.indexOf(serviceUuid) === -1) {
						advertisement.serviceUuids.push(serviceUuid);
				  	}
				}
				break;
			case 0x06: // Incomplete List of 128-bit Service Class UUIDs
		  	case 0x07: // Complete List of 128-bit Service Class UUIDs
				for (j = 0; j < bytes.length; j += 16) {
					serviceUuid = bytes.slice(j, j + 16).toString('hex').match(/.{1,2}/g).reverse().join('');
			      	if (advertisement.serviceUuids.indexOf(serviceUuid) === -1) {
			        	advertisement.serviceUuids.push(serviceUuid);
			      	}
			    }
		    	break;
			case 0x08: // Shortened Local Name
		  	case 0x09: // Complete Local Name»
		    	advertisement.localName = new Buffer(bytes).toString('utf8').replace(/\0/g, ''); // get rid of \u0000
		    	break;
			case 0x0a: // Tx Power Level
		    	advertisement.txPowerLevel = bytes[0];
		    	break;
			case 0x16: // Service Data, there can be multiple occurences
				var serviceDataUuid = bytes.slice(0, 2).toString('hex').match(/.{1,2}/g).reverse().join('');
				var serviceData = new Buffer(bytes.slice(2, bytes.length));

			    advertisement.serviceData.push({
					uuid: serviceDataUuid,
		      		data: serviceData
		    	});
		    	break;
			case 0xff: // Manufacturer Specific Data
		    	advertisement.manufacturerData = new Buffer(bytes);
		    	break;
		}

	    i += (length + 1);		
	}

	var connectable = (type === 0x04 && previouslyDiscovered) ? this.discoveries[address].connectable : (type !== 0x03);

	this.discoveries[address] = {
		address: address,
		addressType: addressType,
		connectable: connectable,
		advertisement: advertisement,
		rssi: rssi,
		count: discoveryCount,
		hasScanResponse: hasScanResponse,
		timestamp: process.hrtime()[0] //time in seconds
	}

	//console.log(this.discoveries);
	return this.discoveries[address];
}

module.exports = {
	GAPProtocolHandler:GAPProtocolHandler
}