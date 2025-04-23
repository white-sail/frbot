const { Markup } = require('telegraf');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');
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

      // O'lchamlarni 2 barobar oshiramiz (retina effekt uchun)
      const scaleFactor = 2;
      const width = 1200 * scaleFactor;
      const rowHeight = 70 * scaleFactor;
      const headerHeight = 300 * scaleFactor;
      const footerHeight = 150 * scaleFactor;
      const height = 100 * scaleFactor + headerHeight + participants.length * rowHeight + footerHeight;

      const canvas = createCanvas(width, height);
      const ctx2d = canvas.getContext('2d');

      // Oq fon
      ctx2d.fillStyle = '#ffffff';
      ctx2d.fillRect(0, 0, width, height);

      // Yuqori qism: Invoice sarlavha va info
      ctx2d.fillStyle = '#000';
      ctx2d.font = `bold ${55 * scaleFactor}px Segoe UI`;
      ctx2d.fillText('HISOB-FAKTURA', 40 * scaleFactor, 80 * scaleFactor);

      ctx2d.font = `${30 * scaleFactor}px Segoe UI`;
      const today = new Date().toLocaleDateString('uz-UZ');
      const invoiceNumber = `INV-${Math.floor(Math.random() * 9000 + 1000)}`;
      ctx2d.fillText(`Sana: ${today}`, 800 * scaleFactor, 50 * scaleFactor);
      ctx2d.fillText(`Invoice raqami: ${invoiceNumber}`, 800 * scaleFactor, 90 * scaleFactor);

      ctx2d.fillText(`Tadbir: "${eventName}"`, 40 * scaleFactor, 150 * scaleFactor);
      ctx2d.fillText(`Mezbon: ${data.owner_name}`, 40 * scaleFactor, 190 * scaleFactor);
      ctx2d.fillText(`Ishtirokchilar roʻyxati`, 40 * scaleFactor, 295 * scaleFactor);

      // Jadval sarlavhalari
      const tableX = 40 * scaleFactor;
      const tableWidth = width - 80 * scaleFactor;
      ctx2d.fillStyle = '#f0f0f0';
      ctx2d.fillRect(tableX, headerHeight, tableWidth, rowHeight);
      ctx2d.strokeStyle = '#cccccc';
      ctx2d.strokeRect(tableX, headerHeight, tableWidth, rowHeight);

      ctx2d.fillStyle = '#000';
      ctx2d.font = `bold ${30 * scaleFactor}px Segoe UI`;
      ctx2d.fillText('#', tableX + 10 * scaleFactor, headerHeight + 45 * scaleFactor);
      ctx2d.fillText('Ishtirokchi', tableX + 80 * scaleFactor, headerHeight + 45 * scaleFactor);
      ctx2d.fillText('To\'lov (so\'m)', width - 250 * scaleFactor, headerHeight + 45 * scaleFactor);

      // Ishtirokchilar ro'yxati
      ctx2d.font = `${28 * scaleFactor}px Segoe UI`;
      participants.forEach((p, i) => {
        const y = headerHeight + rowHeight * (i + 1);
        ctx2d.fillStyle = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
        ctx2d.fillRect(tableX, y, tableWidth, rowHeight);

        ctx2d.strokeStyle = '#e0e0e0';
        ctx2d.strokeRect(tableX, y, tableWidth, rowHeight);

        ctx2d.fillStyle = '#000';
        ctx2d.fillText((i + 1).toString(), tableX + 10 * scaleFactor, y + 45 * scaleFactor);
        ctx2d.fillText(p._name, tableX + 80 * scaleFactor, y + 45 * scaleFactor);
        ctx2d.fillText(Number(p.amount).toLocaleString(), width - 250 * scaleFactor, y + 45 * scaleFactor);
      });

      // Jami summa
      const totalAmount = participants.reduce((sum, p) => sum + Number(p.amount), 0);
      ctx2d.font = `bold ${34 * scaleFactor}px Segoe UI`;
      ctx2d.fillStyle = '#000';
      ctx2d.fillText(`Umumiy: ${totalAmount.toLocaleString()} so'm`, tableX, height - 80 * scaleFactor);

      // QR Code (oxirida chap pastda)
      const qrData = `https://samad1980.pythonanywhere.com/event-participants?name=${encodeURIComponent(eventName)}&owner_id=${ownerId}`;
      const qrImageDataUrl = await QRCode.toDataURL(qrData, { width: 120 * scaleFactor, margin: 1 });
      const qrImage = await loadImage(qrImageDataUrl);
      ctx2d.drawImage(qrImage, width - 150 * scaleFactor, height - 140 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor);

      // Tagdagi eslatma
      ctx2d.font = `italic ${22 * scaleFactor}px Segoe UI`;
      ctx2d.fillStyle = '#444';
      ctx2d.fillText('Hisob-faktura @oqibat1997bot orqali yaratildi', tableX, height - 30 * scaleFactor);

      // Rasmni kichraytirilgan holda eksport qilamiz
      // Buning uchun canvas ni kichik canvasga joylab, buffer olamiz

      const outputWidth = width / scaleFactor;  // 1200
      const outputHeight = height / scaleFactor;

      const outputCanvas = createCanvas(outputWidth, outputHeight);
      const outputCtx = outputCanvas.getContext('2d');

      // Sifat uchun original canvasni kichraytirib chizamiz
      outputCtx.drawImage(canvas, 0, 0, outputWidth, outputHeight);

      const buffer = outputCanvas.toBuffer();

      await ctx.deleteMessage();

      const captionText = `📄 "${eventName}"
👤 Mezbon: ${data.owner_name}
👥 Ishtirokchilar soni: ${participants.length}
💰 Jami summa: ${totalAmount.toLocaleString()} so'm`;

      await ctx.replyWithPhoto({ source: buffer }, { caption: captionText });


    } catch (error) {
      console.error("Xatolik:", error);
      await ctx.reply("Ishtirokchilarni olishda xatolik yuz berdi.");
    }
  });

};
