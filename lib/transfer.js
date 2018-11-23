var spawn = require('child_process').spawn;
const utils = require('./utils')

var transfer = function(conn, web3, BTCRate, ETHRate, params){
    var response = {};
    var address = params[0]
    var coinType = params[4]
    if (coinType == 'BTC'){
        var  completeData= ''
        var bitcoinTransfer = spawn('bitcoin-cli', ['listunspent', '6', '9999999', `["${address}"]`]);
        bitcoinTransfer.stdout.on('data', function (data) { 
            completeData += data
            //console.log('standard output:\n' + data);
        });
        
        // 捕获标准错误输出并将其打印到控制台 
        bitcoinTransfer.stderr.on('data', function (data) { 
            console.log('standard error output:\n' + data); 
        });

        // 注册子进程关闭事件 
        bitcoinTransfer.on('exit', function (code, signal) { 
            console.log('child process exit ,exit:' + code);
            var UTXOs = JSON.parse(completeData)
            UTXOs.sort(utils.descendent('confirmations'))
            console.log(UTXOs)
            response.UTXOs = UTXOs
            response.rate = BTCRate
            conn.sendText(JSON.stringify(response)) 
        });
    }
    if (coinType == 'ETH'){
        var txOptions = {}
        txOptions.from = params[0]
        txOptions.to = params[1]
        txOptions.value = params[2];
        txOptions.gasPrice = parseInt(params[3] * ETHRate);
        var gasLimit = web3.eth.estimateGas(txOptions)
        var nonce = web3.eth.getTransactionCount('0x' + address)
        response.rate = ETHRate
        response.gasLimit = gasLimit;
        response.nonce = nonce;
        conn.sendText(JSON.stringify(response))
    }
};

module.exports = transfer;