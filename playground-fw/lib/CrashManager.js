var fs = require('fs');

var CRASH_REPORT_PATH = '/opt/playground/logs/';
var CRASH_REPORT_FILE = 'crashReport.log';

function CrashManager(path) {
	if (path !== undefined && path !== null) {
		CRASH_REPORT_PATH = path;
	}
	this.setPath(CRASH_REPORT_PATH);
	this.crashReport = CRASH_REPORT_PATH + CRASH_REPORT_FILE;
}

CrashManager.prototype.setupCrashReport = function () {
	var that = this;
	process.on('uncaughtException', function(err) {
		console.log('boom!: ' + that.crashReport);
  		fs.writeFile(that.crashReport, err, function() {
  			// Kill the process and let respawn restart it. There will
  			// be init code that will look for crash reports and handle
  			// them before running the regular code. This way, if it is
  			// a critical error we give a chance to the system to recover
  			process.exit();
  		});
  	});
}

// Looks for a crash report and handles it. This method should be run before
// the regular functionality to give the system a chance to recover from criticial
// errors by, for example, downloading a patch
CrashManager.prototype.handleCrashReport = function () {
	console.log('Checking for: ' + this.crashReport);
	fs.exists(this.crashReport, function(exists) {
		console.log(exists);
		if (exists) {
			console.log('Something didnt go well... Need to handle it');
			fs.unlink(this.crashReport, function() {});
		}
	});
}

CrashManager.prototype.setPath = function(path) {
	CRASH_REPORT_PATH = path;
	fs.mkdir(CRASH_REPORT_PATH, function() {});
}

var cm = new CrashManager('./');
cm.setupCrashReport();
cm.handleCrashReport();

asdf();

module.exports = {
	CrashManager:CrashManager
}