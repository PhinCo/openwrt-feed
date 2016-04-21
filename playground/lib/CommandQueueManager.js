// Uses a Window of size 1
function CommandQueueManager() {
	// Dependendcies
	this.btCtrlrAdapter = null;
	// End of dependencies

	// Only 1 operation at a time
	this.commandQueue = [];
	this.lastCmdSent = 0;
		// When invoking sendPlaygrdound, caller can register
		// a callback. This will hold the reference once we 
		// are processing the command
	this.pendingOperationCallback = null;
}

CommandQueueManager.prototype.resetLastCommandSent = function(commandOp) {
	if (this.lastCmdSent != 0 && commandOp !== undefined && commandOp != this.lastCmdSent) {
		console.log('Command mismatch: Expected: ' + this.lastCmdSent + ' Received: ' + commandOp);
	}
	this.lastCmdSent = 0;
}

// Returns:
//	-1: if we are waiting for a confirmation
//	command: next available command
//	null: Queue is empty
CommandQueueManager.prototype.dequeue = function() {
	if (this.lastCmdSent != 0 || this.btCtrlrAdapter.isConnected === false) {
		return null;
	}

    if (this.lastCmdSent == 0 && this.commandQueue.length > 0) {
    	// We are not waiting for any confirmation
    	var queueElement = this.commandQueue.shift();
    	this.lastCmdSent = queueElement.cmd;
		this.pendingOperationCallback = (queueElement.callback === undefined || queueElement.callback === null ? null : queueElement.callback);
		return queueElement; 
    }

    return null;
}

// cmdType: HCI_COMMAND, HCI_DATA, etc.
// data must be of Buffer type
CommandQueueManager.prototype.queue = function(cmd, data, callback) {
    var queueElement = {};
    queueElement.cmd = cmd;
    queueElement.data = data;
    queueElement.callback = callback;
	this.commandQueue.push(queueElement);
}

// This method goes to the command queue manager
CommandQueueManager.prototype.sendNextCommand = function() {
	var command = this.dequeue();
	if (command === null) {
		return;
	}
	this.btCtrlrAdapter.write(command.data); 
}

module.exports = {
	CommandQueueManager:CommandQueueManager
}