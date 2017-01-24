const Telegraf = require('telegraf');
const {Extra, Markup} = require('telegraf');

const config = require('./config');
const dataService = require('./dataService');

const bot = new Telegraf(config.botToken);

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

dataService.loadUsers();

function userString(msg) {
    return JSON.stringify(msg.from.id == msg.chat.id ? msg.from : {from: msg.from, chat: msg.chat});
}

function logMsg(msg) {
    var from = userString(msg);
    console.log(msg.message.text, from)
}

function logOutMsg(msg, text) {
    console.log('>', {id: msg.chat.id}, text);
}

bot.command('start', msg => {
    //console.log('start', msg.from, msg.chat);
    //logMsg(msg); //commented out because will already get logged in courseTypeSelection
    dataService.registerUser(msg);
    dataService.setCount(msg.chat.id, 0);
    var m = "Hello, I'm your personal counter bot, simply use the commands to control the counter";
    msg.reply(m);
    logOutMsg(msg, m);
});

bot.command('stop', msg => {
    logMsg(msg);
    //dataService.setEnabled(msg.chat.id, false);
    var m = "I'm sorry, Dave, I'm afraid I can't do that.";
    logOutMsg(msg, m);
    msg.reply(m);
});

bot.command('inc', msg => {
  logMsg(msg);
  var val = +dataService.getCount(msg.chat.id);
  ++val;
  dataService.setCount(msg.chat.id, val);
  logOutMsg(msg, val);
  msg.reply(val);
});

bot.command('dec', msg => {
  logMsg(msg);
  var val = +dataService.getCount(msg.chat.id);
  --val;
  dataService.setCount(msg.chat.id, val);
  logOutMsg(msg, val);
  msg.reply(val);
});

bot.command('reset', msg => {
  logMsg(msg);
  var val = 0;
  dataService.setCount(msg.chat.id, val);
  logOutMsg(msg, val);
  msg.reply(val);
});

bot.command('get', msg => {
  logMsg(msg);
  var val = +dataService.getCount(msg.chat.id);
  logOutMsg(msg, val);
  msg.reply(val);
});

bot.command('set', msg => {
  logMsg(msg);
  params = msg.message.text.split(" ");
  if(params.length == 2 && !isNaN(params[1])) {
    var val = params[1];
    dataService.setCount(msg.chat.id, val);
  }
  logOutMsg(msg, val);
  msg.reply(val);
});


bot.startPolling();


module.exports = {
    
}
