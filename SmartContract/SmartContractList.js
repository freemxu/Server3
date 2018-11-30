/* 智能合约列表 */

var SmartContractList = {};
//SmartContractList.Hello = require('./HelloContract');
//SmartContractList.Purchase = require('./PurchaseContract')
//SmartContractList.ConfirmPayment = require('./ConfirmPaymentContract')
SmartContractList.Sell = require('./SellContract')
SmartContractList.Buy = require('./BuyContract')

module.exports = SmartContractList;