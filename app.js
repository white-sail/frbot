require('dotenv').config();
const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN) // Tokenni o‘zingizning token bilan almashtiring

// /start yoki /menu komandasi uchun tugmalar bilan xabar
bot.command('menu', (ctx) => {
  return ctx.reply('Quyidagilardan birini tanlang:', Markup.inlineKeyboard([
    [Markup.button.callback("📅 Tug'ilgan kun", 'bday')],
    [Markup.button.callback("📋 Ro'yxat", 'list')],
    [Markup.button.callback("ℹ️ Ma'lumot", 'info')]
  ]))
})

// Callback tugmalarni tutib olish
bot.action('bday', (ctx) => {
  ctx.answerCbQuery() // foydalanuvchiga tugma bosilganini bildiradi
  ctx.reply("Bugun hech kimning tug'ilgan kuni emas 😊")
})

bot.action('list', (ctx) => {
  ctx.answerCbQuery()
  ctx.reply("Do'stlar ro'yxati hozircha bo'sh.")
})

bot.action('info', (ctx) => {
  ctx.answerCbQuery()
  ctx.reply("Bu bot sizning do'stlaringiz tug'ilgan kunini eslatadi.")
})

bot.launch()

console.log('Bot ishga tushdi...')
