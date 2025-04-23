const { Markup } = require('telegraf');
const axios = require('axios');

module.exports = function (bot) {
  bot.command('new', async (ctx) => {
    const userId = ctx.from.id;

    if (ctx.chat.type !== 'private') {
      return ctx.reply(`⛔ Kechirasiz, bu sahifaga faqat adminlar kira oladi.\nChatID${userId}`); // Guruhda ishlamasin
    }

    await ctx.reply(
      "🔗 Quyidagi tugma orqali sahifani ochishingiz mumkin:",
      Markup.inlineKeyboard([
        [Markup.button.url("🌐 Sahifani ochish", "https://samad1980.pythonanywhere.com/")]
      ])
    );
  });

  // Yangi qo'shilgan /salom komandasi
  bot.command('salom', (ctx) => {
    ctx.reply('Assalomu alaykum!');
  });

  bot.command('tadbir', async (ctx) => {
    try {
      const res = await axios.get('https://samad1980.pythonanywhere.com/event-names'); // API manzilingiz
      const events = res.data.event_names;  // ["Shanbalik-2025", ...]

      if (!events || events.length === 0) {
        return ctx.reply("Hozircha hech qanday tadbir yo'q.");
      }

      // Har bir tadbir nomi uchun tugma yaratamiz
      const buttons = events.map(eventName => [
        Markup.button.callback(eventName, `tadbir_${eventName}`)
      ]);
      const tadbir = `✨ Assalomu alaykum, aziz do‘stlar! ✨

Quyida o'tkazilgan va yodda qolarli tadbirlar ro‘yxatini ko‘rib chiqishingiz mumkin.  
Har bir tadbir nomini bosib, tafsilotlari va ishtirokchilari haqida ma’lumot oling.  

📅 Keling, birga o'tgan damlarni eslaymiz va kelajakdagi uchrashuvlarga tayyorlanamiz! 🤝`;
      await ctx.reply(tadbir, Markup.inlineKeyboard(buttons));
    } catch (err) {
      console.error(err);
      ctx.reply('Tadbirlarni yuklashda xatolik yuz berdi.');
    }
  });

  bot.action(/tadbir_.+/, async (ctx) => {
    const eventName = ctx.match[0].slice(7); // 'tadbir_' ni olib tashlaymiz

    try {
      const response = await axios.get(`https://samad1980.pythonanywhere.com/host-event/${encodeURIComponent(eventName)}`);
      const data = response.data;

      if (!data.hosts || data.hosts.length === 0) {
        await ctx.answerCbQuery(`"${eventName}" tadbiri uchun mezbonlar topilmadi.`);
        return;
      }

      // Mezbonlar uchun inline tugmalar yaratamiz
      const hostButtons = data.hosts.map(host =>
        [Markup.button.callback(host.owner_name, `host_${encodeURIComponent(eventName)}_${host.owner_id}`)]
      );

      // Tugmalar bilan xabarni tahrirlaymiz
      await ctx.editMessageText(
        `🌟 "${eventName}" tadbiri mezbonlari ro'yxati 🌟
      
      Quyidagi mezbonlardan birini tanlab, tafsilotlarni ko‘rib chiqing:
      
      🔹 Sizni qiziqtirgan mezbonni tanlang va tadbir haqida batafsil ma'lumot oling!`,
        Markup.inlineKeyboard(hostButtons)
      );

      await ctx.answerCbQuery();

    } catch (error) {
      console.error('API xatolik:', error);
      await ctx.answerCbQuery("API bilan bog'lanishda xatolik yuz berdi.");
    }
  });

  bot.action(/host_.+_\d+/, async (ctx) => {
    const data = ctx.match[0].slice(5);
    const lastUnderscoreIndex = data.lastIndexOf('_');
    const eventNameEncoded = data.slice(0, lastUnderscoreIndex);
    const ownerId = data.slice(lastUnderscoreIndex + 1);
    const eventName = decodeURIComponent(eventNameEncoded);
  
    await ctx.answerCbQuery();
  
    try {
      const response = await axios.get('https://samad1980.pythonanywhere.com/event-participants', {
        params: { name: eventName, owner_id: ownerId }
      });
  
      const data = response.data;
      const participants = data.participants || [];
  
      if (participants.length === 0) {
        await ctx.reply(`"${eventName}" tadbiri mezboni (ID: ${ownerId}) uchun ishtirokchilar topilmadi.`);
        return;
      }
  
      let total = 0;
      let rows = participants.map((p, i) => {
        const amount = Number(p.amount) || 0;
        total += amount;
        const index = String(i + 1).padEnd(2);
        const name = p._name.padEnd(22).slice(0, 22);
        const amt = amount.toLocaleString().padStart(8);
        return `${index} ${name} ${amt}`;
      });
  
      const table = [
        `📄 ${eventName} tadbiri`,
        `👤 Mezbon: ${data.owner_name}`,
        ``,
        '```',
        '#  Ism                   Summa',
        '-------------------------------',
        ...rows,
        '```',
        `💰 Jami summa: ${total.toLocaleString()} so'm`
      ].join('\n');
  
      await ctx.editMessageText(table, { parse_mode: 'Markdown' });
  
    } catch (error) {
      console.error("Xatolik:", error);
      await ctx.reply("Ishtirokchilarni olishda xatolik yuz berdi.");
    }
  });
  
  
  

};
