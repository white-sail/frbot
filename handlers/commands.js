module.exports = function (bot) {
    bot.start((ctx) => {
      ctx.reply('Salom, hush kelibsiz!');
    });
    bot.salom((ctx)=>{
        ctx.reply("salom hammaga")
    })
  };
  