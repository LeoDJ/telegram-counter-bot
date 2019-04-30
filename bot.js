const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config');
const dataService = require('./dataService');

const bot = new Telegraf(config.botToken);
const AnimationUrl1 = 'https://media.giphy.com/media/R9cQo06nQBpRe/giphy.gif'

const helpMsg = `Comandos de referencia:
/start - Iniciar bot (necesario en grupos)
/caca - Aumenta tu contador de caca
/quitacaca - Decrementa en una unidad tu contador de caca
/getall - Muestra las cacas de todos
/about - Muestra la información del Cagómetro
/help - Muestra esta página de ayuda

`;

const inputErrMsg = `Ups. No has introducido el comando bien, pero no te preocupes, te lo explico:\n\n
Para usar el comando modificar tienes que poner la palabra 'modificar' seguida sin espacios de tu nombre de usuario, en caso de que no esté igual escrito se creará un nuevo contador con ese nombre`;

const incNMsg = `Bienvenido al Cagómetro`;

const aboutMsg = "Este bot ha sido creado por @juandelaoliva utilizando el proyecto base de contador de  @LeoDJ\nCódigo fuente y datos de contacto se pueden encontrar en https://github.com/LeoDJ/telegram-counter-bot";

function getRegExp(command) {
    return new RegExp("/" + command + "[a-z,A-Z,0-9]{0,25}\\b");
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

//---------------------------------------------KEYBOARD---------------------------------------------------------------
const testMenu = Telegraf.Extra
  .markdown()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('Test button', 'test')
  ]))

const menuPrincipal = Markup
.keyboard([
    ['+1 💩'], // Row1
    ['☸ Ajustes', '🥇 Ranking'], // Row2 with 2 buttons
    ['💰 Donar al proyecto', '👥 Compartir'] // Row3 with 3 buttons
  ])
.oneTime()
.resize()
.extra()

const menuSettings = Markup
.keyboard([
    ['-1 💩','🔧 Modificar a lo grande'], // Row1
    ['⬅️ Menú Principal'] // Row
  ])
.oneTime()
.resize()
.extra()


bot.hears('☸ Ajustes', ctx => ctx.reply('💩 Menú de ajustes 💩',menuSettings))
bot.hears('⬅️ Menú Principal', ctx => ctx.reply('💩 Menú Principal 💩',menuPrincipal))
bot.hears('💰 Donar al proyecto', ctx => ctx.reply('💩 Puedes donar al proyecto mediante este link de Paypal 💩\n\n   paypal.me/juandelaoliva'))
bot.hears('👥 Compartir', ctx => ctx.reply('💩 Puedes compartir este bot mediante el siguiente link 💩\n\n   telegram.me/cgmtr_bot'))

//bot.hears('🔧 Modificar', ctx => ctx.replyWithPoll('2b|!2b', ['True', 'False']))


bot.hears(/caca/i, (ctx) => ctx.reply("💩 hablando de cacas, quién va ganando? 💩"));
bot.hears(/mierda/i, (ctx) => ctx.reply("💩 mierda? vamos allá! 💩"));
bot.hears(/peste/i, (ctx) => ctx.reply("💩 jejeje ha dicho peste 💩"));


bot.hears('🔧 Modificar a lo grande', (ctx) => {
    return ctx.reply('💩 Modifica tu número de cacas a lo grande! 💩', Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        m.callbackButton('-100', -100),
        m.callbackButton('-10', -10),
        m.callbackButton('-5', -5),
        m.callbackButton('+5', 5),
        m.callbackButton('+10', 10),
        m.callbackButton('+100', 100)
      ])))
  })

  bot.on('callback_query', (ctx) => {
    var from = userString(ctx);
    var newData=JSON.parse(from).username;
    if(newData==null){
        newData = (JSON.parse(from).from.username);
    }
    if(newData==null){
        newData = (JSON.parse(from).from.first_name);
    }
    var counterId = newData || 0;

    var val = +dataService.getCounter(ctx.chat.id, counterId);
    var delta = parseInt(ctx.callbackQuery.data);


    val = val + delta;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val + " 💩";

    console.log(ctx.callbackQuery.data)
    logOutMsg(ctx, val);
    ctx.reply(val);
  })


//-----------------------------------------------------------------------------------------------------------------------------------

bot.command('broadcast', ctx => {
    if(ctx.from.id == config.adminChatId) {
        var words = ctx.message.text.split(' ');
        words.shift(); //remove first word (which ist "/broadcast")
        if(words.length == 0) //don't send empty message
            return;
        var broadcastMessage = words.join(' ');
        var userList = dataService.getUserList();
        console.log("Sending broadcast message to", userList.length, "users:  ", broadcastMessage);
        userList.forEach(userId => {
            console.log(">", {id: userId}, broadcastMessage);
            ctx.telegram.sendMessage(userId, broadcastMessage);
        });
    }
});

bot.command('start', ctx => {
    logMsg(ctx);
    dataService.registerUser(ctx);
   // dataService.setCounter(ctx.chat.id, '0', 0);
    var m = "💩 Bienvenido al Cagómetro! 💩";
    ctx.reply(m);
   
     logOutMsg(ctx, m);
    setTimeout(() => {
      ctx.reply("💩 Usa los botones para gestionar tus cacas! 💩",menuPrincipal);
    }, 50);  //workaround to send this message definitely as second message
});

bot.command('stop', ctx => {
    logMsg(ctx);
    var m = "💩 Lo siento mucho, pero no puedo hacer eso. 💩";
    logOutMsg(ctx, m);
    ctx.reply(m);
});

bot.command(['incx', 'decx', 'getx', 'setx', 'resetx'], ctx => {
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

bot.hears(('🥇 Ranking'), ctx => {
    logMsg(ctx);
    counters = dataService.getAllCounters(ctx.chat.id);
    console.log("Esto son los counters", counters);
    if(counters == null){
        ctx.reply("💩 Nadie ha registrado ninguna caca todavía 💩")
    }else{
    msg = "";
    Object.keys(counters).forEach(counterId => {
        msg += '[' + counterId + '] ' + counters[counterId].value + " 💩"+ "\n";
    });
    logOutMsg(ctx, msg);
    ctx.reply(msg);}
});

bot.hears(('+1 💩'), ctx => {
    var from = userString(ctx);
    var newData=JSON.parse(from).username;
    if(newData==null){
        newData = (JSON.parse(from).from.username);
    }
    if(newData==null){
        newData = (JSON.parse(from).from.first_name);
    }
    if(newData=="TimelNegro" || newData=="amarlop"){
        newData = null;
        var val = "Lo siento mucho, pero tendrás que esperar al año que viene"
    }else{

   

    logMsg(ctx);
    currentCommand = 'caca';
   // var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = newData || 0;// m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var delta = 1;
    params = ctx.message.text.split(" ");
    if (params.length == 2 && !isNaN(params[1])) {
        delta = Math.floor(params[1]);
    }

    var val = +dataService.getCounter(ctx.chat.id, counterId);
    val += delta;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    if(val!=0 && val%50==0){
        val= "💩 Enhorabuena "+counterId+"! 💩\n\nHas llegado a la gran cifra de las " + val+ " cacas. Sigue esforzándote así y llegarás muy lejos!";
        setTimeout(() => {
            ctx.replyWithAnimation(AnimationUrl1);
            logOutMsg(ctx, 0)
        }, 50);
    }else{
        val = printCounterId + val + " 💩";
    }

}
    
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(('-1 💩'), ctx => {
    var from = userString(ctx);
    var newData=JSON.parse(from).username;
    if(newData==null){
        newData = (JSON.parse(from).from.username);
    }
    if(newData==null){
        newData = (JSON.parse(from).from.first_name);
    }
    logMsg(ctx);
    currentCommand = 'quitacaca';
    //var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = newData || 0; //get id of command, return 0 if not found

    var delta = 1;
    params = ctx.message.text.split(" ");
    if (params.length == 2 && !isNaN(params[1])) {
        delta = Math.floor(params[1]);
    }

    var val = +dataService.getCounter(ctx.chat.id, counterId);
    val -= delta;
    dataService.setCounter(ctx.chat.id, counterId, val);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    
    val = printCounterId + val + " 💩";
    logOutMsg(ctx, val);
    ctx.reply(val);
});

// bot.hears(getRegExp('reset'), ctx => {
//     logMsg(ctx);
//     currentCommand = 'reset';
//     var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
//     var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

//     var val = 0;
//     dataService.setCounter(ctx.chat.id, counterId, val);

//     var printCounterId = counterId ? "[" + counterId + "] " : "";
//     val = printCounterId + val+ " 💩";
//     logOutMsg(ctx, val);
//     ctx.reply(val);
// });

bot.hears(getRegExp('get'), ctx => {
    logMsg(ctx);
    currentCommand = 'get';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    var val = +dataService.getCounter(ctx.chat.id, counterId);

    var printCounterId = counterId ? "[" + counterId + "] " : "";
    val = printCounterId + val+ " 💩";
    logOutMsg(ctx, val);
    ctx.reply(val);
});

bot.hears(getRegExp('modificar'), ctx => {
    logMsg(ctx);
    currentCommand = 'modificar';
    var m = ctx.message.text.match(getRegExp(currentCommand))[0]; //filter command
    var counterId = m.substring(m.indexOf(currentCommand) + currentCommand.length) || 0; //get id of command, return 0 if not found

    params = ctx.message.text.split(" ");
    if (params.length == 2 && !isNaN(params[1])) {
        var val = Math.floor(params[1]);
        dataService.setCounter(ctx.chat.id, counterId, val);
        var printCounterId = counterId ? "[" + counterId + "] " : "";
        val = printCounterId + val+ " 💩";
    } else {
        val = inputErrMsg;
    }

    logOutMsg(ctx, val);
    ctx.reply(val);
});


bot.startPolling();


module.exports = {

}
