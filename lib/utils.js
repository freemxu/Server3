var checkForTransactionReceipt = function(transaction, callback){
    var count = 0;
    var callbackFired = false;

    // wait for receipt
    var filter = transaction._eth.filter('latest', function(e){
        if (!e && !callbackFired) {
            count++;

            // stop watching after 50 blocks (timeout)
            if (count > 50) {

                filter.stopWatching(function() {});
                callbackFired = true;

                if (callback)
                    callback(new Error('Transaction couldn\'t be found after 50 blocks'));
                else
                    throw new Error('Transaction couldn\'t be found after 50 blocks');

            } else {

                transaction._eth.getTransactionReceipt(transaction.transactionHash, function(e, receipt){
                    if(receipt && !callbackFired) {
                        if (callbackFired)
                            return;

                        filter.stopWatching(function() {});
                        callbackFired = true;
                        if (callback){
                            callback(e, transaction)
                        } else {
                            console.log("Transaction mined! " + "transaction hash: " + transaction.transactionHash)
                        }
                    }
                });
            }
        }
    });
};

/* ================ 深拷贝 ================ */
var deepClone = function(initalObj, finalObj) {
    var obj = finalObj || {};
    for (var i in initalObj) {
        var prop = initalObj[i];
  
        // 避免相互引用对象导致死循环，如initalObj.a = initalObj的情况
        if(prop === obj) {
            continue;
        }
  
        if (typeof prop === 'object') {
            obj[i] = (prop.constructor === Array) ? [] : Object.create(prop);
        } else {
            obj[i] = prop;
        }
    }
    return obj;
}

var descendent = function (prop) {
    return function (obj1, obj2) {
        return obj2[prop] - obj1[prop] //降序        
    } 
};

module.exports = {
    checkForTransactionReceipt: checkForTransactionReceipt,
    deepClone: deepClone,
    descendent: descendent
};