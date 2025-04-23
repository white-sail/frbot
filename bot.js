const { Telegraf } = require('telegraf');
const { botToken } = require('./config');

const bot = new Telegraf(botToken);

// Handlers
require('./handlers/commands')(bot);
require('./handlers/actions')(bot);

bot.launch();
console.log('Bot ishga tushdi 🚀');

// 👇 HTTP serverni ishga tushuramiz (Render uchun muhim)
const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Telegram bot ishga tushdi 🚀');
}).listen(PORT, () => {
  console.log(`HTTP server ${PORT} portda ishlayapti`);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
