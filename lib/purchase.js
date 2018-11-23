var spawn = require('child_process').spawn;

var purchase = function(conn, web3, params){
    var response = {};
    var address = params[0]
    var coinType = params[1]
    if (coinType == 'BTC'){
        var bitcoinPurchase = spawn('bitcoin-cli', ['sendtoaddress', address, '1']);
        bitcoinPurchase.stdout.on('data', function (data) { 
            console.log('standard output:\n' + data);
        });
        
        // 捕获标准错误输出并将其打印到控制台 
        bitcoinPurchase.stderr.on('data', function (data) { 
            console.log('standard error output:\n' + data); 
        });

        // 注册子进程关闭事件 
        bitcoinPurchase.on('exit', function (code, signal) { 
            console.log('child process exit ,exit:' + code); 
        });

        var completeData = ''
        var bitcoinAddressInfo = spawn('bitcoin-cli', ['getaddressinfo', address])
        bitcoinAddressInfo.stdout.on('data', function (data) { 
            completeData += data
            //console.log('standard output:\n' + data);
        });
        
        // 捕获标准错误输出并将其打印到控制台 
        bitcoinAddressInfo.stderr.on('data', function (data) { 
            console.log('standard error output:\n' + data); 
        });

        // 注册子进程关闭事件 
        bitcoinAddressInfo.on('exit', function (code, signal) { 
            console.log('child process exit ,exit:' + code); 
            var addressInfo = JSON.parse(completeData)
            if (!addressInfo.iswatchonly){
                console.log('Import address: ' + address)
                var bitcoinImportAddress = spawn('bitcoin-cli', ['importaddress', address])
                bitcoinImportAddress.stdout.on('data', function (data) { 
                    console.log('standard output:\n' + data);
                });
                
                // 捕获标准错误输出并将其打印到控制台 
                bitcoinImportAddress.stderr.on('data', function (data) { 
                    console.log('standard error output:\n' + data); 
                });

                // 注册子进程关闭事件 
                bitcoinImportAddress.on('exit', function (code, signal) { 
                    console.log('child process exit ,exit:' + code); 
                });
            }
        });
    }
    if (coinType == 'ETH'){
        var coinbase = web3.eth.coinbase
        console.log(address)
        console.log(coinbase)
        if (web3.personal.unlockAccount(coinbase, '123')){
            web3.eth.sendTransaction({from: coinbase, to: address, value: web3.toWei(1, "Ether")})
            console.log('unlocked')
        }
    }
};

module.exports = purchase;