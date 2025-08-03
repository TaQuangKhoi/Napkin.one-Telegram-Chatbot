import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { redis } from './redis';

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is not set!');
}

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

bot.start((ctx) => {
  const userName = ctx.message.from.username || 'friend';
  ctx.reply(`Welcome ${userName}! 🚀\n\nI'm a bot template. Send /help to see what I can do.`);
});

bot.help((ctx) => ctx.reply(
  `
Here are the available commands:

/start - Welcome message
/help - Show this help message
/ping - Check if the bot is alive

Send me any text, and I'll echo it back!
  `
));

bot.command('ping', (ctx) => ctx.reply(`Pong! 🏓 Latency: ${Date.now() - ctx.message.date * 1000}ms`));

// Simple echo functionality
bot.on(message('text'), async (ctx) => {
  const userMessage = ctx.message.text;
  const userId = ctx.message.from.id;

  // Example of using Redis
  await redis.incr(`user:${userId}:messages`);
  const messageCount = await redis.get(`user:${userId}:messages`);

  ctx.reply(`Echo: "${userMessage}"\nThis is your message #${messageCount}.`);
});

// Generic handler for other message types
bot.on('message', (ctx) => ctx.reply('I can only process text messages for now.'));