var fs = require('fs'); 

const HCI_LOGS = 1;
const DEBUG = 2;
const ERROR = 3;
const NET = 4;

var SHOW_HCI_LOGS = false;
var DISABLE_ALL = false;
var USE_FILE = true;

var PATH = '/opt/playground/logs/';

var MAX_FILE_SIZE_BYTES = 524288;

const NEW_LOG = 'logsNew.log';
const OLD_LOG = 'logsOld.log';

function swapNewOldLogs(callback) {
	fs.rename(PATH + NEW_LOG, PATH + OLD_LOG, function() {
		fs.unlink(PATH + NEW_LOG, callback);
	});
}

function writeToFile(text, callback) {
	var stats = fs.stat(PATH + 'logsNew.log', function(error, stats) {
		if (error != null) {
	    	fs.appendFile (PATH + NEW_LOG, text + '\n', function(err) {
	    		if (callback !== undefined) {
		    		callback();
		    	}
			});
	    } else {
		 	var sizeBytes = stats["size"];
		 	if (sizeBytes >= MAX_FILE_SIZE_BYTES) {
		 		swapNewOldLogs(function() {
			    	fs.appendFile (PATH + NEW_LOG, text + '\n', function(err) {
			    		if (callback !== undefined) {
				    		callback();
				    	}
					});
		 		});
		 	} else {
		    	fs.appendFile (PATH + NEW_LOG, text + '\n', function(err) {
		    		if (callback !== undefined) {
			    		callback();
			    	}
				});
		 	}
		}		
	});
}

function Log(text, type, callback) {
	if (DISABLE_ALL) {
		return;
	}	

	if (type == HCI_LOGS) {
		if (SHOW_HCI_LOGS) {
			if (USE_FILE) {
				writeToFile(Date() + ' :: ' + text);
			} else {
				console.log(text);
			}
		}
	} else {
		if (USE_FILE) {
			writeToFile(Date() + ' :: ' + text, callback);
		} else {
			console.log(text);
		}
	}
}

function enableHciLogs(enable) {
	SHOW_HCI_LOGS = enable;
}

function disableAll(disable) { 
	DISABLE_ALL = disable;
}

function setLogsPath(path) {
	PATH = path;
}

function useFile(enable) {
	USE_FILE = enable;
}

function setMaxLogSizeBytes(size) {
	MAX_FILE_SIZE_BYTES = size;
}

fs.mkdir(PATH, function() {});

module.exports = {
	Log: Log,
	HCI_LOGS: HCI_LOGS,
	DEBUG: DEBUG,
	ERROR: ERROR,
	NET: NET,
	enableHciLogs:enableHciLogs,
	useFile:useFile,
	setLogsPath:setLogsPath,
	setMaxLogSizeBytes:setMaxLogSizeBytes,
	NEW_LOG_NAME:NEW_LOG,
	OLD_LOG_NAME:OLD_LOG,
	disableAll:disableAll
}