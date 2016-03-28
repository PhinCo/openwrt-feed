const net = require('net');

const HCI_COMMAND					= 0x01;
const HCI_DATA 						= 0x02;
const HCI_EVENT 					= 0x04;
const PLAYGROUND_INTERNAL_COMMAND	= 0x08;

function BTCtrlrLoopbackTCPAdapter() {
	// Dependencies
	this.hciProtocolHandler = null;
	this.playgroundCommandHandler = null;
	this.commandQueueManager = null;
	// End of dependencies

	this.socket = null;
	this.isConnected = false;
}

BTCtrlrLoopbackTCPAdapter.prototype.connect = function(callback) {
	var that = this;
	this.socket = new net.Socket();
	this.socket.connect(8080, '127.0.0.1', function() {
        console.log('connected to host');
		that.isConnected = true;			
		that.commandQueueManager.sendNextCommand();

		if (callback !== undefined) {
			callback(true);
		}
	});

	this.socket.on('error', function(e) {
    	console.log('BLE Daemon connection error: ' + e)
    	this.isConnected = false;
    	process.exit(1);
	});

	this.socket.on('close', function(had_error) {
    	this.isConnected = false;
    	process.exit(1);
	});

	// Careful! If data is too long, we will need to stitch it together
	this.socket.on('data', function(data) {
		while (data.length > 0) {
			// First 2 bytes are the length for the packet
			var packetLength = data[0] << 8 | data[1] & 0xFF;
			var packet = data.slice(2, 2 + packetLength);
        	data = data.slice(packetLength + 2);
        	that.handleIncomingPackets(packet);
        }
	});
}

BTCtrlrLoopbackTCPAdapter.prototype.write = function(data) {
	this.socket.write(data);
}

BTCtrlrLoopbackTCPAdapter.prototype.handleIncomingPackets = function(packet) {
	// Work with the packet
	// First comes the commandType (1 byte)
	var command = packet[0];

	if (command == HCI_EVENT) {
		this.hciProtocolHandler.onEvent(packet.slice(1));
	} else if (command == HCI_DATA) {
		this.hciProtocolHandler.onAcl(packet.slice(1));
	} else if (command == PLAYGROUND_INTERNAL_COMMAND) {
		this.playgroundCommandHandler.onCommand(packet.slice(1));
	} else {
    	console.log('Received an unknown data packet: ' + command);
	}
}

module.exports = {
	BTCtrlrLoopbackTCPAdapter: BTCtrlrLoopbackTCPAdapter
}