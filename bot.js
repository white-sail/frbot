const { Telegraf } = require('telegraf');
const { botToken } = require('./config');

const bot = new Telegraf(botToken);

// Handlers
require('./handlers/commands')(bot);
require('./handlers/actions')(bot);

bot.launch();
console.log('Bot ishga tushdi 🚀');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
