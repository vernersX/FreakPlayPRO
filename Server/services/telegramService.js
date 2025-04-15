// services/telegramService.js
const { Telegraf } = require('telegraf');
const { models } = require('../db/init');
const { User } = models;

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    try {
        const telegramId = String(ctx.from.id);
        const username = ctx.from.username || `User_${telegramId}`;
        let user = await User.findOne({ where: { telegramId } });
        if (!user) {
            user = await User.create({ telegramId, username });
        }
        await ctx.reply(`Welcome, ${user.username}! You have ${user.coins} coins.`);
    } catch (err) {
        console.error('Error in /start:', err);
        ctx.reply('Oops, an error occurred. Please try again.');
    }
});

bot.command('balance', async (ctx) => {
    try {
        const telegramId = String(ctx.from.id);
        const user = await User.findOne({ where: { telegramId } });
        if (!user) return ctx.reply('No user found. Please /start first.');
        ctx.reply(`Your balance: ${user.coins} coins.`);
    } catch (err) {
        console.error('Error in /balance:', err);
        ctx.reply('An error occurred. Please try again.');
    }
});

module.exports = {
    launchBot: () => {
        bot.launch()
            .then(() => console.log('Telegram bot started (polling)...'))
            .catch(err => console.error('Bot launch error:', err));
    },
};
