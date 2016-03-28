var http = require('http');
var Utils = require('./../lib/Utils');
var StateStore = require('./../lib/StateStore');
var OTAManager = require('./OTAManager');
var Logger = require('./../lib/Logger');


const HOST = "10.9.0.213";
const PORT = 9408;

const STORE_NAMESPACE = 'playground';
const DEVICE_ID_KEY = 'deviceid';

const CHECKIN_PERIOD_MS = 15000;

function CheckinService() {
	this.stateStore = new StateStore.StateStore(STORE_NAMESPACE);
	this.otaInProgress = false;
}

CheckinService.prototype.register = function(callback) {
	var url = "/v1/registration/clients";

	var options = {
	  host: HOST,
	  port: PORT,
	  path: url,
	  method: 'PUT',
	  headers: {'Content-Type': 'application/json'}
	};

	var that = this;

	var req = http.request(options, function(response) {
		var body = ''
	  	response.on('data', function (chunk) {
	    	body += chunk;
	  	});

	  	response.on('end', function () {
	  		if (response.statusCode != 200) {
		  		callback(false, response.statusCode);
		  	} else {
		  		body = JSON.parse(body);
		  		that.stateStore.putValue(STORE_NAMESPACE, DEVICE_ID_KEY, body.clientId, function(status) {
			    	callback(status);
	  			});
		  	}
	  	});
	});

	req.on('error', function(e) {
    	Logger.Log('Registration Error: ' + e, Logger.ERROR)
    	callback(false);
	});


	Utils.readDeviceInfo(function(obj) {
		Utils.readSwBuildId(function(status, value) {
			if (!status) {
				Logger.Log('CRITICAL: Unable to read the SW BUILD ID. Getting latest OTA from server', Logger.ERROR);
				value = 'N/A';
			}
			var requestBody = {};
			requestBody.oemId='echoliv';
			requestBody.hardwareId=obj.serial;
			requestBody.hardwareRev='na';
			requestBody.buildId=value;
			requestBody.buildRev=0;
			requestBody.signingCert='na';
			requestBody.hardwareSerials=[obj.eth0, obj.wlan0, obj.btmac, obj.serial];
			requestBody.nonce = new Date().getTime();
			req.write(JSON.stringify(requestBody));
			req.end();
		});
	});
}

// callback (status, updateRequired, remoteVersion) (status == true)
// callback (status, statuscode) (status == false)
CheckinService.prototype.checkin = function(clientId, callback) {
	var that = this;

	Utils.readSwBuildId(function(status, value) {
		if (!status) {
			Logger.Log('CRITICAL: Unable to read the SW BUILD ID. Getting latest OTA from server', Logger.ERROR);
			value = 'N/A';
		}

		var url = "/v1/checkin/clients";

		var options = {
		  host: HOST,
		  port: PORT,
		  path: url,
		  method: 'POST',
		  headers: {'Content-Type': 'application/json'}
		};

		Logger.Log('CHECKIN');

		var req = http.request(options, function(response) {
			var body = ''
		  	response.on('data', function (chunk) {
		    	body += chunk;
		  	});

		  	response.on('end', function () {
		  		if (response.statusCode != 200) {
			  		callback(false, response.statusCode);
			  	} else {
			  		body = JSON.parse(body);
			  		if (body.buildId == null) {
			  			Logger.Log('Invalid build id received from server', Logger.ERROR);
			  			callback(false);
			  			return;
			  		}
			    	callback(true, (value !== body.buildId), body.buildId);
			  	}
		  	});
		});

		req.on('error', function(e) {
	    	Logger.Log('Checkin Error: ' + e, Logger.ERROR)
	    	callback(false);
		});

		var requestBody = {};
		requestBody.clientId = clientId;
		requestBody.buildId = value;
		req.write(JSON.stringify(requestBody));
		req.end();
	})
}

// callback (status, updateRequired, remoteVersion)
CheckinService.prototype.checkin2 = function(clientId, callback) {
	var that = this;

	Utils.readSwBuildId(function(status, value) {
		if (!status) {
			Logger.Log('CRITICAL: Unable to read the SW BUILD ID. Getting latest OTA from server', Logger.ERROR);
			value = 'N/A';
		}

		var url = "/v1/checkin/clients";

		var options = {
		  host: HOST,
		  port: PORT,
		  path: url,
		  method: 'POST',
		  headers: {'Content-Type': 'application/json'}
		};

		Logger.Log('CHECKIN');

		var req = http.request(options, function(response) {
			var body = ''
		  	response.on('data', function (chunk) {
		    	body += chunk;
		  	});

		  	response.on('end', function () {
		  		if (response.statusCode != 200) {
			  		callback(false, response.statusCode);
			  	} else {
			  		body = JSON.parse(body);
			  		if (clientId !== body.clientId) {
				  		that.stateStore.putValue(STORE_NAMESPACE, DEVICE_ID_KEY, body.clientId, function(status) {
		  				});
				  	}
			    	callback(true, (value !== body.buildId), body.buildId);
			  	}
		  	});
		});

		req.on('error', function(e) {
	    	Logger.Log('Checkin Error: ' + e, Logger.ERROR)
	    	callback(false);
		});

		Utils.readDeviceInfo(function(obj) {
			Utils.readSwBuildId(function(status, value) {
				var requestBody = {};
				requestBody.oemId='echoliv';
				requestBody.hardwareId=obj.serial;
				requestBody.hardwareRev='na';
				requestBody.buildId=value;
				requestBody.buildRev=0;
				requestBody.signingCert='na';
				requestBody.hardwareSerials=[obj.eth0, obj.wlan0, obj.btmac, obj.serial];
				requestBody.nonce = new Date().getTime();
				req.write(JSON.stringify(requestBody));
				req.end();
			});
		});
	})
}

CheckinService.prototype.start = function() {
	var theService = this;
	(function loop () {
		theService.main();
		setTimeout(loop, CHECKIN_PERIOD_MS);
	})();
}

CheckinService.prototype.main = function() {
	var that = this;
	this.stateStore.getValue(STORE_NAMESPACE, DEVICE_ID_KEY, function(value) {
		if (value === undefined || value === null) {
			that.register(function(status, errorCode) {
				Logger.Log('Registration status: ' + status, Logger.DEBUG);
			});
		} else {
			that.checkin(value, function(status, updateRequired, remoteVersion) {
				if (!status) {
					if (updateRequired == 404) {
						// Server cannot find the device any longer, we need to checkin again
						that.stateStore.removeValue(STORE_NAMESPACE, DEVICE_ID_KEY, function(status) {});
					}
					Logger.Log('Error during checkin');
					return;
				}

 				if (updateRequired) {
 					if (that.otaInProgress) return;

 					Logger.Log('OTA Update required for remote version: ' + remoteVersion, Logger.DEBUG);

 					that.otaInProgress = true;
 					var fm = new OTAManager.OTAManager();
					fm.downloadImageAndSignatureCheck('http://' + HOST + ':' + PORT + '/v1/ota/' + remoteVersion, 
					    '/opt/Playground/keys/pubkey.pem', 
					    function(status, err) {
					        if (status) {
					            Logger.Log('About to start the low level update process', Logger.DEBUG);
								fm.doUpgrade(function(status) {
									that.otaInProgress = false;
								});
					        } else {
					            Logger.Log('There was an error downloading and verifying the OTA image: ' + err, Logger.ERROR);
    					    	that.otaInProgress = false;
					        }
					    }
					) 					
 				}
			})
		}
	})
}

module.exports = {
	CheckinService:CheckinService
}

