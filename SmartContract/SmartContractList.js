/* 智能合约列表 */

var SmartContractList = {};
SmartContractList.Hello = require('./HelloContract');
SmartContractList.Purchase = require('./PurchaseContract')
SmartContractList.ConfirmPayment = require('./ConfirmPaymentContract')

module.exports = SmartContractList;