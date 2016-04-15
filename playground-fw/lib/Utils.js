var fs = require('fs'); 
var Logger = require('./Logger');

function le16(d,i) {
	return d[i] | (d[i+1] << 8);
}

function cmd_exec(cmd, args, cb_stdout, cb_end) {
	var spawn = require('child_process').spawn, child = spawn(cmd, args), me = {};
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

const SW_BUILD_ID_PATH = '/swbuildid.txt';

// callback(status, id)
function readSwBuildId(callback) {
    fs.readFile(SW_BUILD_ID_PATH, 'utf8', function (err, data) {
        if (err) {
        	Logger.Log('Error reading ' + SW_BUILD_ID_PATH, Logger.ERROR);
        	callback(false);
        	return;
        }
        callback(true, data.trim());
    });
}

function typeOf (obj) {
	return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function generateWifiConfigFile(ssid, auth, key, callback) {
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

var keepBlinking = true;
var finalLedState = false;

function blinkLed(value, delay) {
        setTimeout(function() {
                fs.writeFile('/sys/class/gpio/gpio14/value', value, function(err) {
                });
                if (keepBlinking) {
                        if (value === '1') {
                                value = '0'
                        } else {
                                value = '1';
                        }
                        blinkLed(value, delay);
                } else {
                	enableLed(finalLedState);
                }
        }, delay);
}

function blinkLedFast() {
	keepBlinking = true;	
    blinkLed('1', 100);
}

function blinkLedSlow() {
	keepBlinking = true;
	blinkLed('1', 750);
}

// enable: Target final state of the LED after it stops blinking
function stopLedBlinking(enable) {
	keepBlinking = false;
	finalLedState = enable;
	enableLed(enable);
}

function enableLed(enable) {
        fs.writeFile('/sys/class/gpio/gpio14/value', enable == true ? '1' : '0', function(err) {
        });
}

function readMemInfo(callback) {
	fs.readFile('/proc/meminfo', 'utf8', function (err, data) {
	    if (err) throw err;
	    var array = data.split('\n');
	    var obj = {};

	    for (var i = 0; i < array.length; i++) {
	            var pieces = array[i].split(':');
	            if (pieces.length < 2) continue;
	            var name = pieces[0].trim();
	            var value = pieces[1].trim();
	            if (name === 'Active') obj.activeMem = value;
	            if (name === 'MemTotal') obj.totalMem = value;
	    }
	    callback(obj);
    });
}

function readNodePid(callback) {
	execCommand('ps | grep "[n]ode /opt/ConnectedYard/ConnectedYardMain.js"', function(data) {
		if (data === null || data.length < 5) {
			callback(-1);
			return
		}
		callback(data.substring(0, data.indexOf('root')).trim());
	})
}

function _readCpuInfo(callback) {
	fs.readFile('/proc/stat', 'utf8', function (err, data) {
	    if (err) throw err;
	    var array = data.split('\n');
	    var obj = {};

	    // The first line has all the info we need:
	    // user, nice, system, idle, iowait, irq, softirq, steal, guest, guest_nice
	    for (var i = 0; i < 1; i++) {
	    	    var info = array[i].substring('cpu'.length).trim();
	            var pieces = info.split(' ');
	            if (pieces.length < 10) continue;
	            var user = parseInt(pieces[0].trim());
	            var nice = parseInt(pieces[1].trim());
	            var system = parseInt(pieces[2].trim());
	            var idle = parseInt(pieces[3].trim());
	            var iowait = parseInt(pieces[4].trim());
	            var irq = parseInt(pieces[5].trim());
	            var softirq = parseInt(pieces[6].trim());
	            var steal = parseInt(pieces[7].trim());
	            var guest = parseInt(pieces[8].trim());
	            var guest_nice = parseInt(pieces[9].trim());
	            var total = user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
	            obj.cpuUser = user;
	            obj.cpuSystem = system;
	            obj.cpuIdle = idle;
	            obj.cpuTotal = total;
	    }
	    callback(obj);
    });

}

function readCpuLoad(callback) {
	_readCpuInfo(function(reading1) {
		setTimeout(function() {
			_readCpuInfo(function(reading2) {
				var user = 100 *  (((reading2.cpuTotal - reading1.cpuTotal) - (reading2.cpuIdle - reading1.cpuIdle)) / (reading2.cpuTotal - reading1.cpuTotal));
				callback(user);
			});
		}, 500);
	})
}

module.exports = {
	cmd_exec:cmd_exec,
	execCommand:execCommand,
	cmd_system:cmd_system,
	le16:le16,
	readDeviceInfo:readDeviceInfo,
	typeOf:typeOf,
	processDefaultPSR:processDefaultPSR,
	generateWifiConfigFile:generateWifiConfigFile,
	readSwBuildId:readSwBuildId,
	blinkLedFast:blinkLedFast,
	blinkLedSlow:blinkLedSlow,
	stopLedBlinking:stopLedBlinking,
	enableLed:enableLed,
	readMemInfo:readMemInfo,
	readNodePid:readNodePid,
	readCpuLoad:readCpuLoad
}