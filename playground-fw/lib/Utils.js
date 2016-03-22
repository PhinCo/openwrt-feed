function le16(d,i) {
	return d[i] | (d[i+1] << 8);
}

function cmd_exec(cmd, args, cb_stdout, cb_end) {
	var spawn = require('child_process').spawn, child = spawn(cmd, args), me = this;
	me.exit = 0;  // Send a cb to set 1 when cmd exits
	me.stdout = '';
	child.stdout.on('data', function (data) { cb_stdout(me, data) });
	child.stdout.on('end', function () { cb_end(me) });
}

// Wrapper around method above
function execCommand(command, callback) {
	cmd_exec('sh',['-c', command],
		function (me, data) {
			me.stdout += data.toString();
		},
		function (me) {
			me.exit = 1;
			callback(me.stdout);
	    }
	);
}
 
function cmd_system(cmd, callback) {
	const exec = require('child_process').exec;
	const child = exec(cmd, function(error, stdout, stderr) {
		if (error !== null) {
  			if (callback) {
      			callback(false);
      		}
		} else {
			if (callback) {
				callback(true);
			}
		}
	});
}

function readDeviceInfo(callback) {
	execCommand('lsids', function(output) {
		var data = JSON.parse(output);
		execCommand('uname -r', function(output) {
			data.firmware = output.trim();
			callback(data);
		});
	});
}


// 48:e2:44:f3:93:70 ----> 00F3 9370 0044 48E2
function processBTMacAddress(input) {
	var split = input.split(':');

	if (split.length < 6) {
		throw 'FATAL ERROR: Invalid MAC address in ART partition';
	}

	return '00' + split[3] + ' ' + split[4] + split[5] + ' 00' + split[2] + ' ' + split[0] + split[1];
}

function processDefaultPSR(srcPath, dstPath) {
	var fs = require('fs'); 

	fs.exists(dstPath, function(exists) {
	  	if (exists) { 
	    	console.log('Custom default.psr file already exists');
	  	} else {
			readDeviceInfo(function(info) {
				var btmac = processBTMacAddress(info.btmac);
			    fs.readFile(srcPath, 'utf8', function (err, data) {
			        if (err) throw err;

			        data = data.replace('{FTRIM}', info.bttrim);
			        data = data.replace('{BDADDR}', btmac);

			        fs.writeFile (dstPath, data, function(err) {
			            if (err) console.log('Error generating default.psr');			            
			        });
			    });
			});
		}
	});
}

function typeOf (obj) {
	return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function generateWifiConfigFile(ssid, auth, key, callback) {
	var fs = require('fs'); 
	var srcPath = '/etc/config/wireless_template';
	var dstPath = '/etc/config/wireless';

    fs.readFile(srcPath, 'utf8', function (err, data) {
        if (err) throw err;

        data = data.replace('{SSID}', ssid);
        data = data.replace('{ENCRYPTION}', auth);
        data = data.replace('{KEY}', key);

        fs.writeFile (dstPath, data, function(err) {
            if (err) {
            	throw new Error('Unable to write the wireless config file');
            } else {
            	callback();
            }
        });
    });
}


module.exports = {
	cmd_exec:cmd_exec,
	execCommand:execCommand,
	cmd_system:cmd_system,
	le16:le16,
	readDeviceInfo:readDeviceInfo,
	typeOf:typeOf,
	processDefaultPSR:processDefaultPSR,
	generateWifiConfigFile:generateWifiConfigFile	
}