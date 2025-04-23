const { Markup } = require('telegraf');

module.exports = function (bot) {
  bot.command('menu', (ctx) => {
    ctx.reply('Tanlang:', Markup.inlineKeyboard([
      [Markup.button.callback('🟢 On', 'on')],
      [Markup.button.callback('🔴 Off', 'off')]
    ]));
  });

  bot.action('on', (ctx) => {
    ctx.editMessageText('Siz "On" tugmasini bosdingiz.');
  });

  bot.action('off', (ctx) => {
    ctx.editMessageText('Siz "Off" tugmasini bosdingiz.');
  });

  // Yangi qo'shilgan /salom komandasi
  bot.command('salom', (ctx) => {
    ctx.reply('Assalomu alaykum!');
  });
};
