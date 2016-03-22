var fs = require('fs');
var http = require('http');
var crypto = require('crypto');
var Utils = require('./../lib/Utils');

const DEST = '/tmp/';

/* Generating the keys: 
    1. openssl genrsa -out ./privkey.pem 2048
    2. openssl rsa -in ./privkey.pem -pubout -out ./pubkey.pem
*/

function FirmwareUpgradeManager() {
}

// Call this method first and wait for the callback's status value. If the status
// is true, then invoke doUpgrade.
// downloadUrl: Url to retrieve the OTA image
// sigCheckUrl: Url to retrieve digital signature of the OTA image
// callback(matches, error): ststus true means the download and verification succeeded so it is safe to call doUpgrade.
//  If status is false, error contains an error message
FirmwareUpgradeManager.prototype.downloadAndVerify = function(pubKeyPath, downloadUrl, sigCheckUrl, callback) {
	download(downloadUrl, DEST, function(status, res) {
        if (!status) {
            callback(false, res);
            return
        }

		hashFileWithSHA256(DEST + fileName, function(status, hash) {
            if (!status) {
                callback(false, 'Hash generation error');
                return;
            }

			checkSignature(pubKeyPath, sigCheckUrl, hash, function(matches, error) {
                if (!matches) {
                    callback(false, 'Error checking signature');
                    return;
                }
				callback(matches);
			})
		})
	})
}

FirmwareUpgradeManager.prototype.doUpgrade = function(callback) {
    Utils.cmd_system('tar zcf /tmp/sysupgrade.tgz /etc/config', function(status) {
        if (status) {
            Utils.cmd_system('mtd -r -j /tmp/sysupgrade.tgz write /tmp/sysupgrade.bin /dev/mtd6', function(status) {
                callback(status);
            })
        } else {
            callback(false);
        }
    })
}

// callback(status, error/sigCheck)
// If status is true, then the second parameter is the sigCheck. Otherwise
// the second parameter is the error message
FirmwareUpgradeManager.prototype.downloadOTASigCheck = function(sigCheckUrl, callback) {
    var request = http.get(sigCheckUrl, function(response) {
        // check if response is success
        if (response.statusCode !== 200) {
            callback(false, 'Server error: ' + response.statusCode);
            return;
        }

        // Continuously update stream with data
        var remoteSigned = '';
        response.on('data', function(d) {
            remoteSigned += d;
        });

        response.on('end', function() {
            callback(true, remoteSigned);
        });        
    });

    // check for request error too
    request.on('error', function (err) {
        if (callback) {
            return callback(false, err.message);
        }
    }); 
}


// callback(status, message)
function download(url, dest, callback) {
    var request = http.get(url, function(response) {
        // check if response is success
        if (response.statusCode !== 200) {
            callback(false, 'Server error: ' + response.statusCode);
            return;
        }

        var cd = response.headers['content-disposition'];
        var fileName = cd.substring(cd.indexOf('filename="') + 'filename="'.length, cd.length - 1);
		var file = fs.createWriteStream(dest + fileName);

        response.pipe(file);

        file.on('finish', function() {
            file.close(function(err) {
            	if (err != null) {
            		callback(false, err);
            	} else {
            		callback(true, fileName);
            	}
            });
        });

	    file.on('error', function(err) { // Handle errors
	        fs.unlink(dest, function(err) {
            }); // Delete the file async. (But we don't check the result)

	        if (callback) {
	            return callback(false, err.message);
	        }
	    });
    });

    // check for request error too
    request.on('error', function (err) {
        fs.unlink(dest, function(err) {
        });

        if (callback) {
            console.log('BBOOMM: ' + err);
            return callback(false, err);
        }
    });
}

// callback(status, hash)
function hashFileWithSHA256(path, callback) {
	var hash = crypto.createHash('sha256');
	var stream = fs.createReadStream(path);

	stream.on('data', function (data) {
	    hash.update(data, 'binary')
	})

	stream.on('end', function () {
        callback(true, hash.digest());
	})	

	stream.on('error', function() {
		callback(false)
	})
}

// This method only works with nodejs >= 4.0
function encryptWithRsaPrivateKey(data, prKeyPath) {
    var privateKey = fs.readFileSync(prKeyPath, "utf8");
    var buffer = new Buffer(data);
    var encrypted = crypto.privateEncrypt(privateKey, buffer);
    return encrypted.toString("hex");
};

// This method only works with nodejs >= 4.0
var decryptWithRsaPublicKey = function(data, pubKeyPath) {
    var publicKey = fs.readFileSync(pubKeyPath, "utf8");
    var buffer = new Buffer(data, "hex");
    var decrypted = crypto.publicDecrypt(publicKey, buffer);
    return decrypted.toString("utf8");
}

// This method works for all versions of nodejs, including < 4.0. Requires 
// playgroundble binary running on the device (to implement the pubkey decryption)
// callback(matches, error)
// sigCheck must be a hex encoded value
function checkSignature(pubKeyPath, sigCheck, localSignature, callback) {
    var Playground = require('./../api/Playground');

    fs.readFile(pubKeyPath, 'utf8', function (err, data) {
        if (err) {
            callback(false, err.message);
            return
        }

        pubKeyArray = data.split('').map(function(e) { return e.charCodeAt() });
        Playground.CryptoApi.pubKeyDecrypt(pubKeyArray, convertHexToArray(sigCheck), function(status, plain) {
            if (!status) {
                callback(false, 'Error decrypting key');
                return;
            }

            if (plain.length != localSignature.length) {
                callback(false, 'Signatures do not match');
                return
            }

            for (var i = 0; i < plain.length; i++) {
                if (plain[i] !== localSignature[i]) {
                    callback(false, 'Signatures do not match');
                    return
                }
            }

            callback(true);
        });
    });
}


function convertHexToArray(hex) {
    if (hex.length % 2 != 0) {
        hex.unshift(0);
    }

    var result = [];

    for(var i = 0; i < hex.length; i+=2) {
        result.push(parseInt(hex.slice(i,i + 2), 16));
    }

    return result;
}

/* Usage Example
const HOST = "10.9.0.247";
const PORT = 9000;

var fm = new FirmwareUpgradeManager();
fm.downloadOTASigCheck('http://' + HOST + ':' + PORT + '/v1/ota/check/1', function(status, value) {
    if (status) {
        fm.downloadAndVerify('/opt/Playground/lib/pubkey.pem', 
                             'http://' + HOST + ':' + PORT + '/v1/ota/1', 
                             value, 
                             function(status, err) {
                                if (status) {
                                    //fm.doUpgrade();
                                    console.log('Veredict for updating: ' + status);
                                } else {
                                    console.log('There was an error: ' + err);
                                }
                             }
        );
    } else {
        console.log('Error downloading OTA Signature check: ' + value);
    }
});
*/