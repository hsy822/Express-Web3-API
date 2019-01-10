const express = require('express');
const bodyParser = require('body-parser');
//web3 add
const Web3 = require('web3')

//local
//const web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.67.130:8545"));

//aws
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const abi = JSON.parse('[ { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" } ], "name": "approveAndCall", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFromTo", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": false, "stateMutability": "nonpayable", "type": "fallback" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "version", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" } ]')
const TokenContract = web3.eth.contract(abi);

//local
//const contractInstance = TokenContract.at('0x7c391fac1d883d812207b635c229bf8163fc4a82');

//aws
const contractInstance = TokenContract.at('0x8f2cd5d3e14622cf445cc8e1cb4f0d69b5741395');

const app = express();
const port = process.env.PORT || 8011;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

web3.eth.defaultAccount = web3.eth.accounts[0];

//web3 miner module
web3._extend({
  property: 'miner',
  methods:
  [
      new web3._extend.Method({
          name: 'start',
          call: 'miner_start',
          params: 1,
          inputFormatter: [web3._extend.formatters.formatInputInt],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'stop',
          call: 'miner_stop',
          params: 1,
          inputFormatter: [web3._extend.formatters.formatInputInt],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'setExtra',
          call: 'miner_setExtra',
          params: 1,
          inputFormatter: [web3._extend.utils.formatInputString],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'setGasPrice',
          call: 'miner_setGasPrice',
          params: 1,
          inputFormatter: [web3._extend.utils.formatInputString],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'startAutoDAG',
          call: 'miner_startAutoDAG',
          params: 0,
          inputFormatter: [],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'stopAutoDAG',
          call: 'miner_stopAutoDAG',
          params: 0,
          inputFormatter: [],
          outputFormatter: web3._extend.formatters.formatOutputBool
      }),
      new web3._extend.Method({
          name: 'makeDAG',
          call: 'miner_makeDAG',
          params: 1,
          inputFormatter: [web3._extend.formatters.inputDefaultBlockNumberFormatter],
          outputFormatter: web3._extend.formatters.formatOutputBool
      })
  ],
  properties:
  [
      new web3._extend.Property({
          name: 'hashrate',
          getter: 'miner_hashrate',
          outputFormatter: web3._extend.utils.toDecimal
      })
  ]
});

let checkWork = () => {
  if (web3.eth.getBlock("pending").transactions.length > 0) {
      if (web3.eth.mining) return;
      console.log("== Pending transactions! Mining...");
      web3.miner.start(1);
  } else {
      web3.miner.stop();  // This param means nothing
      console.log("== No transactions! Mining stopped.");
  }
}

web3.eth.filter("latest", (err, block) => { checkWork(); });
web3.eth.filter("pending", (err, block) => { checkWork(); });

checkWork();	

//Token
var jwt = require('jsonwebtoken');
var tokenKey = "sotolab20151223";

//new token
app.post('/api/newtoken', (req, res) => {
  let userAuth = req.body['authentication'];
  let userAccount = req.body['account'];
  let userPassword = req.body['password'];
  let response;

  if (userAuth == 'haveaniceday') {

    var payLoad = {
      "userAccount": userAccount,
      "userPassword": userPassword
    };

    var token = jwt.sign(payLoad, tokenKey, {
        algorithm: 'HS256', //"HS256", "HS384", "HS512", "RS256", "RS384", "RS512" default SHA256
        expiresIn: 604800 // 604800  // 1 week   1440 (24*60) //expires in 24 hours
    });

    response = {
      'result': '200',
      'token': token
    }
  } else {
    response = {
      'result': 'failed',
      'message': 'authentication false' 
    }
  }

  res.send(response);

})

//new account
app.post('/api/newaccount', (req, res) => {

  let password = req.body['password'];
  let userToken = req.body['token'];
  let response;
  
  if (password === undefined || userToken === undefined) {
    response = {
        "result": "404",
        "message": "Please, input the token or password !!"
    };
  } else {
    response = {
      "result": "200",
      "account": web3.personal.newAccount(password)
    };
  }
  res.send(response);
})

//get default account
app.get('/api/defaultaccount', (req, res) => {
  res.send({ defaultAccount: web3.eth.defaultAccount })
})

//get acccount list & balance
app.get('/api/accounts', (req, res) => {
  let accountsBalance = [];
  let accounts = web3.eth.accounts;

  accounts.forEach(element => {
    accountsBalance.push({
      account: element,
      balance: contractInstance.balanceOf(element)
    })
  });

  res.send(accountsBalance);
});

// get balance
app.get('/api/balance/:account', (req, res) => {
  res.send({ balance: contractInstance.balanceOf(req.params.account) });
});

// trasfer from-to
app.post('/api/transfer/', (req, res) => {
  
  let from = req.body['from'];
  let to = req.body['to'];
  let value = req.body['value'];
  let userToken = req.body['token'];
  let response;
  
  if (from === undefined || to === undefined || value === undefined || userToken === undefined) {
    response = {
        "result": "404",
        "message": "Please, check the params !!"
    };
    res.send(response);
  } else {
    try {
      let decoded = jwt.verify(userToken, tokenKey);
      console.log("async : ", decoded);

      web3.personal.unlockAccount(web3.eth.defaultAccount, "1234");
    
      let result = contractInstance.transferFromTo(from, to, value, (err, transactionHash) => {
        let intervalFn = setInterval(() => {
          if(web3.eth.getTransaction(transactionHash).blockNumber > 0){
            clearInterval(intervalFn);
            response = {
              transactionHash: transactionHash,
              msg: 'Transfer Success!'
            }

            res.send(response);
          }
        }, 1000);   
      });
    } catch (err) {
        console.log(err);
        response = {
            "result": "404",
            "message": err
        };
        res.send(response);
    }
    
  }
  
  
});

app.listen(port, () => console.log(`Listening on port ${port}`));