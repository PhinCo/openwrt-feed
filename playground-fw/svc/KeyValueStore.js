var fs = require('fs');

var STORE_PATH = '/etc/config/playgroundstore.db';

function _loadStore() {
	try {
		var data = fs.readFileSync(STORE_PATH, 'utf8');
		if (data == null || data.length == 0) return {};
		return JSON.parse(data);
	} catch (err) {
		//console.log(err);
	}
	return {};
}

function _persistStore(store, callback) {
	if (store == null) {
		callback(true);
		return;
	}

    fs.writeFile (STORE_PATH, JSON.stringify(store), function(err) {
        if (err) {
        	callback(false);
        } else {
        	callback(true);
        }
    })
}

function KeyValueStore(path) {
	if (path !== undefined && path !== null) {
		STORE_PATH = path;
	}
	this.store = {};
	this.store = _loadStore();
}

KeyValueStore.prototype.putValue = function(namespace, key, value, callback) {
	var nsDict = this.store[namespace] || {};
	nsDict[key] = value;
	this.store[namespace] = nsDict;
	_persistStore(this.store, function(status) {
		callback(status);
	});

}

KeyValueStore.prototype.getValue = function(namespace, key, callback) {
	var nsDict = this.store[namespace] || {};
	callback(nsDict[key]);
}

KeyValueStore.prototype.removeValue = function(namespace, key, callback) {
	var nsDict = this.store[namespace] || {};
	delete nsDict[key];
	this.store[namespace] = nsDict;
	_persistStore(this.store, function(status) {
		callback(status);
	});
}

module.exports = {
	KeyValueStore:KeyValueStore
}
