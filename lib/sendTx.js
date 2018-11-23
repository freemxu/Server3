var spawn = require('child_process').spawn;
const utils = require('./utils')

var sendTx = function(conn, web3, params){
    var response = {};
    var tx = params[0]
    var coinType = params[1]
    if (coinType == 'BTC'){
        var bitcoinSendTx = spawn('bitcoin-cli', ['sendrawtransaction', tx]);
        bitcoinSendTx.stdout.on('data', function (data) { 
            console.log('standard output:\n' + data);
        });
        
        // 捕获标准错误输出并将其打印到控制台 
        bitcoinSendTx.stderr.on('data', function (data) { 
            console.log('standard error output:\n' + data); 
        });

        // 注册子进程关闭事件 
        bitcoinSendTx.on('exit', function (code, signal) { 
            console.log('child process exit ,exit:' + code); 
        });
    }
    if (coinType == 'ETH'){
        web3.eth.sendRawTransaction('0x' + tx, function(err, hash) {
            if (!err){
                var tx1 = {}
                tx1.transactionHash = hash;
                tx1._eth = web3.eth;
                utils.checkForTransactionReceipt(tx1, function(e, tx2){
                    console.log("Transaction mined! " + "transaction hash: " + tx2.transactionHash)
                    response.transactionHash = tx2.transactionHash;
                    conn.sendText(JSON.stringify(response))
                })
            } else
                console.log(err)
        });
    }
};

module.exports = sendTx;