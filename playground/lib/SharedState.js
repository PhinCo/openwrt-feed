var keyValuePairs = {
	autoConnect:true
};

function putValue(key, value) {
	keyValuePairs[key] = value;
}

function getValue(key) {
	return keyValuePairs[key];
}

module.exports = {
	putValue: putValue,
	getValue: getValue
}