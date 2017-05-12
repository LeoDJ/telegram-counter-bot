const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config');
const dataService = require('./dataService');

const bot = new Telegraf(config.botToken);

const helpMsg = `Command reference:
/start - Start bot (mandatory in groups)
/inc - Increment default counter
/incN - Increment counter N (replace N with any number)
/dec - Decrement counter
/decN - Decrement counter N
/reset - Reset counter back to 0
/resetN - Reset counter N back to 0
/set X - Set counter to x [/set x]
/setN - Set counter N to x [/setN x]
/get - Show current counter
/getN - Show value of counter N
/stop - Attemt to stop bot
/about - Show information about the bot
/help - Show this help page`;

const inputErrMsg = `💥 BOOM... 🔩☠🔧🔨⚡️
Hm, that wasn't supposed to happen. You didn't input invalid characters, did you?
The usage for this command is \"/set x\", where x is a number.
At the moment, I can only count integers, if you want to add your own number system, please feel free to do so. Just click here: /about `;

const incNMsg = `To use multiple counters, simply put the number of the counter you want to increase directly after the command like so:
/inc1 <- this will increment counter 1
/inc  <- this will increment the default counter (0)
This does also work with other commands like /dec1 /reset1 /set1 /get1`;

const aboutMsg = "This bot was created by @LeoDJ\nSource code and contact information can be found at https://github.com/LeoDJ/telegram-counter-bot";

function getRegExp(command) {
    return new RegExp("/" + command + "[0-9]*\\b");
}

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

dataService.loadUsers();

function userString(msg) {
    return JSON.stringify(msg.from.id == msg.chat.id ? msg.from : {
        from: msg.from,
        chat: msg.chat
    });
}

function logMsg(msg) {
    var from = userString(msg);
    console.log('<', msg.message.text, from)
}

function logOutMsg(msg, text) {
    console.log('>', {
        id: msg.chat.id
    }, text);
}

bot.command('start', msg => {
    logMsg(msg);
    dataService.registerUser(msg);
    dataService.setCount(msg.chat.id, 0);
    var m = "Hello, I'm your personal counter bot, simply use the commands to control the counter";
    msg.reply(m);
    logOutMsg(msg, m);
    setTimeout(() => {
        msg.reply(0);
        logOutMsg(msg, 0)
    }, 50); //workaround to send this message definitely as second message
});

bot.command('stop', msg => {
    logMsg(msg);
    var m = "I'm sorry, Dave, I'm afraid I can't do that.";
    logOutMsg(msg, m);
    msg.reply(m);
});

bot.command('incN', msg => {
    logMsg(msg);
    logOutMsg(msg, incNMsg);
    msg.reply(incNMsg);
});

bot.command('help', msg => {
    logMsg(msg);
    logOutMsg(msg, helpMsg);
    msg.reply(helpMsg);
});

bot.command('about', msg => {
    logMsg(msg);
    logOutMsg(msg, aboutMsg);
    msg.reply(aboutMsg);
});

bot.hears(getRegExp('inc'), msg => {
    logMsg(msg);
    currentCommand = 'inc';
    var m = msg.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(msg.chat.id, counterId);
    ++val;
    dataService.setCounter(msg.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(msg, val);
    msg.reply(val);
});

bot.hears(getRegExp('dec'), msg => {
    logMsg(msg);
    currentCommand = 'dec';
    var m = msg.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(msg.chat.id, counterId);
    --val;
    dataService.setCounter(msg.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(msg, val);
    msg.reply(val);
});

bot.hears(getRegExp('reset'), msg => {
    logMsg(msg);
    currentCommand = 'reset';
    var m = msg.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = 0;
    dataService.setCounter(msg.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(msg, val);
    msg.reply(val);
});

bot.hears(getRegExp('get'), msg => {
    logMsg(msg);
    currentCommand = 'get';
    var m = msg.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(msg.chat.id, counterId);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(msg, val);
    msg.reply(val);
});

bot.hears(getRegExp('set'), msg => {
    logMsg(msg);
    currentCommand = 'set';
    var m = msg.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    params = msg.message.text.split(" ");
    if (params.length == 2 && !isNaN(params[1])) {
        var val = Math.floor(params[1]);
        dataService.setCounter(msg.chat.id, counterId, val);
        var printCounterId = counterId ? "[" + counterId + "] " : "";
        val = printCounterId + val;
    } else {
        val = inputErrMsg;
    }

    logOutMsg(msg, val);
    msg.reply(val);
});


/*
bot.command('inc', msg => {
    var val = +dataService.getCount(msg.chat.id); //convert to number with +
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
    var val = Math.floor(params[1]);
    dataService.setCount(msg.chat.id, val);
  }
  else {
    val = inputErrMsg;
  }
  logOutMsg(msg, val);
  msg.reply(val);
});*/


bot.startPolling();


module.exports = {

}
