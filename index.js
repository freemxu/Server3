// 引入WebSocket模块
var SmartContractList = require('./SmartContract/SmartContractList')

var ws = require('nodejs-websocket')
var PORT = 3000
var levelup = require('levelup')
var leveldown = require('leveldown')
var db = levelup(leveldown('./smartContractDB'))
//var hysd = levelup(leveldown('./hysd'))

var checkForTransactionReceipt = require('./lib/utils').checkForTransactionReceipt
var balance = require('./lib/balance')
var purchase = require('./lib/purchase')
var transfer = require('./lib/transfer')
var sendTx = require('./lib/sendTx')

var BTCRate = 100; //Sotashi/B
var ETHRate = 1000000000; //Wei/Gas

var connections = {}

var server = ws.createServer(function(conn){
    console.log('New connection')
    //console.log(conn.key)
    conn.on("text", function(str){
        var obj = JSON.parse(str);
        console.log("Received:\n ")
        console.log(obj)

        //const HttpProvider = "http://172.18.245.18:8100"
        const HttpProvider = "http://192.168.1.4:8100"
        //const HttpProvider = "http://127.0.0.1:8100"
        //const HttpProvider = "http://192.168.43.220:8100"
        //const HttpProvider = "http://localhost:8100"
        var Web3 = require('web3');
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            web3 = new Web3(new Web3.providers.HttpProvider(HttpProvider));
        }

        var response = {};

        try{
            for (var key in obj) {
            	if (key === 'balance'){
            		balance(conn, web3, obj[key])
            	}
                if (key === 'transfer'){
                    transfer(conn, web3, BTCRate, ETHRate, obj[key])
                }
                if (key === 'signedTx'){
                    sendTx(conn, web3, obj[key])
                }
                if (key === 'gasLimitAndNonce'){
                    var txOptions = {}
                    txOptions = obj[key][0]
                    var address = obj[key][1]
                    response.gasLimit = web3.eth.estimateGas(txOptions)
                    response.nonce = web3.eth.getTransactionCount(address)
                    conn.sendText(JSON.stringify(response))
                }
                if (key === 'deployContract') {
                	var signedContract = obj[key]
                	var signedTx = signedContract[0]
                	var contractName = signedContract[1]
                	var contractAddr = signedContract[2]
                	console.log(signedContract)
                	console.log(contractName)
                	console.log(contractAddr)
                	web3.eth.sendRawTransaction('0x' + signedTx, function(err, hash) {
                        if (!err){
                            var tx = {}
                            tx.transactionHash = hash;
                            tx._eth = web3.eth;
                            checkForTransactionReceipt(tx, function(e, tx){
                                console.log("Contract mined! " + "transaction hash: " + tx.transactionHash)
                                db.put(contractAddr, contractName, function (err) {
					if (err) return console.log('Ooops!', err) // some kind of I/O error
					  // 3) Fetch by key
					  db.get(contractAddr, function (err, value) {
					  	if (err) return console.log('Ooops!', err) // likely the key was not found
					  // Ta da!
					  	console.log('contractName = ' + value)
				 	  })
		            	})
                            	response.transactionHash = tx.transactionHash;
                            	conn.sendText(JSON.stringify(response))
                            })
                        } else
                            console.log(err)
                        });
                }
                if (key === 'loadContract'){
                	db.createReadStream()
					  .on('data', function (data) {
					  	console.log(data)
					  	response[data.key.toString()] = data.value.toString();
					  })
					  .on('error', function (err) {
					    console.log('Oh my!', err)
					  })
					  .on('close', function () {
					    console.log('Stream closed')
					  })
					  .on('end', function () {
					  	console.log(response)
                        response.SmartContractList = SmartContractList;
					  	conn.sendText(JSON.stringify(response))
					    console.log('Stream ended')
					  })
				}
                if (key === 'listContract'){
                    response = SmartContractList;
                    conn.sendText(JSON.stringify(response))
                }
                if (key === 'callContract'){
                    var abi = JSON.parse(obj[key].pop())
                    var address = obj[key].pop()
                    var functionName = obj[key].pop()
                    var args = obj[key].pop()
                    //console.log('eval result:')
                    //console.log(eval(args.join()))
                    var contract = web3.eth.contract(abi).at(address);
                    //console.log(args.join())
                    response.result = contract[functionName].apply(null, args)
                    console.log(response)
                    conn.sendText(JSON.stringify(response))
                }
                if (key === 'purchase'){
                    purchase(conn, web3, obj[key])
                }
            }
        }
        catch(err){
            response.err = err
            console.log(err)
        }
        //conn.sendText(JSON.stringify(response));
        //console.log(response)
    })
    conn.on("close",function(code,reason){
        //console.log(server)
        console.log("connection closed")
    })
    conn.on("error",function(err){
        //console.log(server)
        console.log("handle err")
        console.log(err)
    })
}).listen(PORT)
//console.log(server)
console.log('websocket server listening on port ' + PORT)
