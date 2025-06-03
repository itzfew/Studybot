import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:greeting');

// Greeting handler (only for private chats)
const greeting = () => async (ctx: Context) => {
  try {
    debug('Triggered "greeting" handler');
    const message = ctx.message;
    const chat = ctx.chat;
    const user = ctx.from;

    if (!chat || chat.type !== 'private' || !message || !user || !('text' in message)) return;

    const text = message.text.trim().toLowerCase();
    const greetings = ['hi', 'hello', 'hey', 'hii', 'heyy', 'hola', 'start', '/start'];

    if (greetings.includes(text)) {
      await ctx.reply(
        `Welcome ${user.first_name}! You have full access.\n\nUse /help or /study or type example: @Material_eduhubkmrbot <mtg> to explore available commands and get started with your NEET Preparation!`,
        {
          parse_mode: 'Markdown',
        }
      );
    }
  } catch (err) {
    console.error('Greeting logic error:', err);
  }
};

export { greeting };
