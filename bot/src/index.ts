import { Bot, InlineKeyboard } from 'grammy';
import 'dotenv/config';

const bot = new Bot(process.env.BOT_TOKEN!);
const APP_URL = process.env.APP_URL || 'https://your-app.vercel.app';

// /start — welcome + Open Store button
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🏪 Open Store', APP_URL);

  await ctx.reply(
    `Welcome to **Creator Store**! 🛍️\n\n` +
      `Browse and buy digital products from independent creators.\n\n` +
      `Tap the button below to open the store.`,
    { reply_markup: keyboard, parse_mode: 'Markdown' }
  );
});

// /store — direct link to mini app
bot.command('store', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🛒 Go to Store', APP_URL);
  await ctx.reply('Open the Creator Store:', { reply_markup: keyboard });
});

// /help — show help text
bot.command('help', async (ctx) => {
  await ctx.reply(
    `*Creator Store Bot* 🛍️\n\n` +
      `/start — Open the store\n` +
      `/store — Quick link to store\n` +
      `/help — Show this help\n\n` +
      `Browse products, buy digital items, and support creators!`
  );
});

// Start polling
bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.start({
  onStart: (info) => {
    console.log(`Bot running! @${info.username}`);
  },
});
