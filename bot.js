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

function userString(ctx) {
    return JSON.stringify(ctx.from.id == ctx.chat.id ? ctx.from : {
        from: ctx.from,
        chat: ctx.chat
    });
}

function logMsg(ctx) {
    var from = userString(ctx);
    console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
    console.log('>', {
        id: ctx.chat.id
    }, text);
}

bot.command('start', ctx => {
    logMsg(ctx);
    dataService.registerUser(ctx);
    dataService.setCount(ctx.chat.id, 0);
    var m = "Hello, I'm your personal counter bot, simply use the commands to control the counter";
    ctx.reply(m);
    logOutMsg(ctx, m);
    setTimeout(() => {
        ctx.reply(0);
        logOutMsg(ctx, 0)
    }, 50); //workaround to send this message definitely as second message
});

bot.command('stop', ctx => {
    logMsg(ctx);
    var m = "I'm sorry, Dave, I'm afraid I can't do that.";
    logOutMsg(ctx, m);
    ctx.reply(m);
});

bot.command(['incN', 'decN', 'getN', 'setN', 'resetN'], ctx => {
    logMsg(ctx);
    logOutMsg(ctx, incNMsg);
    ctx.reply(incNMsg);
});

bot.command('help', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, helpMsg);
    ctx.reply(helpMsg);
});

bot.command('about', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, aboutMsg);
    ctx.reply(aboutMsg);
});

bot.hears(getRegExp('inc'), ctx => {
    logMsg(ctx);
    currentCommand = 'inc';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(ctx.chat.id, counterId);
    ++val;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(getRegExp('dec'), ctx => {
    logMsg(ctx);
    currentCommand = 'dec';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(ctx.chat.id, counterId);
    --val;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(getRegExp('reset'), ctx => {
    logMsg(ctx);
    currentCommand = 'reset';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = 0;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(getRegExp('get'), ctx => {
    logMsg(ctx);
    currentCommand = 'get';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(ctx.chat.id, counterId);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val;
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(getRegExp('set'), ctx => {
    logMsg(ctx);
    currentCommand = 'set';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    params = ctx.message.text.split(" ");
    if (params.length == 2 && !isNaN(params[1])) {
        var val = Math.floor(params[1]);
        dataService.setCounter(ctx.chat.id, counterId, val);
        var printCounterId = counterId ? "[" + counterId + "] " : "";
        val = printCounterId + val;
    } else {
        val = inputErrMsg;
    }

    logOutMsg(ctx, val);
    ctx.reply(val);
});


bot.startPolling();


module.exports = {

}
