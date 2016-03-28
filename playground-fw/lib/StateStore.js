var utils = require('./Utils');
var Log = require('./Logger');

function StateStore(namespace) {
	console.log('Create state store');
	utils.cmd_system('touch /etc/config/' + namespace, function(status) {
		if (!status) {
			console.log('Error initializing state store');

			Log.Log('Error initializing state store', Log.ERROR);
			return;
		} 
		utils.cmd_system('uci set ' + namespace + '.misc=settings', function(status) {
			if (!status) {
				Log.Log('Error initializing state store: Adding provisioning section', Log.ERROR);
				return;
			}
			utils.cmd_system('uci commit ' + namespace, function(status) {
				if (!status) {
					//console.log('Error initializing state store: Committing provisioning section');
				}
			});
		});		
	});
}

StateStore.prototype.putValue = function(namespace, name, value, callback) {	
	utils.cmd_system('uci set ' + namespace + '.misc.' + name + '=' + value, function(status) {
		if (!status) {
			console.log('Error storing state');
			callback(false);
			return;
		}
		utils.cmd_system('uci commit ' + namespace, function(status) {
			if (!status) {
				console.log('Error committing state');
				callback(false);
				return;
			}
			callback(true);
		});
	});
}

StateStore.prototype.getValue = function(namespace, name, callback) {
    utils.cmd_exec('sh',['-c','uci get ' + namespace + '.misc.' + name + ' 2>/dev/null'],
        function (me, data) { me.stdout += data.toString(); },
        function (me) { 
        	var value = me.stdout.trim();
        	if (value === undefined || value === null || value.length === 0) {
        		value = null;
        	}
        	callback(value); 
        }
    );
}

StateStore.prototype.removeValue = function(namespace, name, callback) {
	utils.cmd_system('uci delete ' + namespace + '.misc.' + name, function(status) {
		if (!status) {
			callback(false);
			return;
		} 
		utils.cmd_system('uci commit ' + namespace, function(status) {
			if (!status) {
				callback(false);
			} else {
				callback(true);
			}
		});			
	});
}

module.exports = {
	StateStore:StateStore
}
