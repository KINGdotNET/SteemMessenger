const steem = require('steem');
const storage = require('./storage.js');
const crypto = require ('./crypto');

var LaraPublicKey = 'STM6CoeaohnQBMLYbQU3nkyfGqMeLG68n8MVnf5Zk2dzN2Bocdq43';

exports.firstLogin = function(data, out){
	steem.api.getAccounts([data.user], function(err, result) {
        if(result.length > 0) {
            pubWif = result[0]["memo_key"];
            var isvalid = steem.auth.wifIsValid(data.privWif, pubWif);
            if(isvalid == true){
                var sessionKeys = crypto.generate_session_keys(data.privWif, LaraPublicKey);
                var authenticationToken = crypto.authentication_token(sessionKeys.authenticationKey);
                Container = "#" + JSON.stringify({user: data.user, token: authenticationToken});
                encodedContainer = steem.memo.encode(data.privWif, LaraPublicKey, Container);
                out({user: data.user, key: data.privWif, encodedmsg: encodedContainer});

            }
            else {
            	out({error: "bad memo key"});
            }
        }
        else {
            out({error: "bad account"});	
        }
    });
}

exports.reLogin = function(data, out){
	storage.readSafeStorage(data, function(wallet){
        console.log(wallet);
		if(wallet.user){
            steem.api.getAccounts([wallet.user], function(err, result) {
                if(result.length > 0) {
                    pubWif = result[0]["memo_key"];
                    var isvalid = steem.auth.wifIsValid(wallet.privateKey, pubWif);
                    if(isvalid == true){
                        var sessionKeys = crypto.generate_session_keys(wallet.privateKey, LaraPublicKey);
                        var authenticationToken = crypto.authentication_token(sessionKeys.authenticationKey);
                        Container = "#" + JSON.stringify({user: wallet.user, token: authenticationToken});
                        encodedContainer = steem.memo.encode(wallet.privateKey, LaraPublicKey, Container);
                        out({wallet: wallet, encodedContainer: encodedContainer});
                    }
                    else {
                        out({error: "bad memo key"});
                    }
                }
                else {
                    out({error: "bad account"});    
                }
            });
		}
        else{
            out({error: "bad password"})
        }
	})
}