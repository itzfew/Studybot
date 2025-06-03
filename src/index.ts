import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { saveToSheet } from './utils/saveToSheet';
import { fetchChatIdsFromSheet } from './utils/chatStore';
import { about } from './commands/about';
import { help, handleHelpPagination } from './commands/help';
import { pdf, handleCallbackQuery } from './commands/pdf';
import { greeting } from './text/greeting';
import { production, development } from './core';
import { isPrivateChat } from './utils/groupSettings';
import { setupBroadcast } from './commands/broadcast';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const ADMIN_ID = 6930703214;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN not provided!');
console.log(`Running bot in ${ENVIRONMENT} mode`);

const bot = new Telegraf(BOT_TOKEN);

// Enable inline mode
bot.on('inline_query', pdf());

// --- Commands ---
bot.command('about', about());

// Multiple triggers for help/material/pdf content
const helpTriggers = ['help', 'study', 'material', 'pdf', 'pdfs'];
helpTriggers.forEach(trigger => bot.command(trigger, help()));
bot.hears(/^(help|study|material|pdf|pdfs)$/i, help());

// Admin: /users
bot.command('users', async (ctx) => {
  if (ctx.from?.id !== ADMIN_ID) return ctx.reply('You are not authorized.');

  try {
    const chatIds = await fetchChatIdsFromSheet();
    await ctx.reply(`📊 Total users: ${chatIds.length}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: 'Refresh', callback_data: 'refresh_users' }]],
      },
    });
  } catch (err) {
    console.error('Error fetching user count:', err);
    await ctx.reply('❌ Unable to fetch user count.');
    await forwardFailedCommand(ctx, err);
  }
});

// Admin: /broadcast
setupBroadcast(bot);

// --- Callback Handler ---
bot.on('callback_query', async (ctx) => {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) {
    await ctx.answerCbQuery('Unsupported callback type');
    return;
  }

  const data = callback.data;

  try {
    if (data.startsWith('help_page_')) {
      await handleHelpPagination()(ctx);
    } else if (data === 'refresh_users' && ctx.from?.id === ADMIN_ID) {
      const chatIds = await fetchChatIdsFromSheet();
      await ctx.editMessageText(`📊 Total users: ${chatIds.length}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: 'Refresh', callback_data: 'refresh_users' }]],
        },
      });
    } else if (data.startsWith('get_pdf_')) {
      await handleCallbackQuery(ctx);
    } else {
      await ctx.answerCbQuery('Unknown action');
    }
  } catch (err) {
    console.error('Error handling callback query:', err);
    await forwardFailedCommand(ctx, err);
  }
});

// --- /start ---
bot.start(async (ctx) => {
  if (!ctx.chat || !isPrivateChat(ctx.chat.type)) return;

  const user = ctx.from;
  const chat = ctx.chat;

  try {
    await greeting()(ctx);
    await pdf()(ctx);
  } catch (err) {
    console.error('Error in /start command:', err);
    await forwardFailedCommand(ctx, err);
  }

  const alreadyNotified = await saveToSheet(chat);
  console.log(`Saved chat ID: ${chat.id} (${chat.type})`);

  if (chat.id !== ADMIN_ID && !alreadyNotified) {
    const name = user?.first_name || 'Unknown';
    const username = user?.username ? `@${user.username}` : 'N/A';
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `*New user started the bot!*\n\n*Name:* ${name}\n*Username:* ${username}\n*Chat ID:* ${chat.id}\n*Type:* ${chat.type}`,
      { parse_mode: 'Markdown' }
    );
  }
});

// --- Text Handler ---
bot.on('text', async (ctx) => {
  if (!ctx.chat || !isPrivateChat(ctx.chat.type)) return;

  const text = ctx.message.text?.toLowerCase();
  const user = ctx.from;
  const isCommand = text.startsWith('/');

  // Forward non-command messages to admin
  if (!isCommand && ctx.chat.id !== ADMIN_ID) {
    const name = user?.first_name || 'Unknown';
    const username = user?.username ? `@${user.username}` : 'N/A';
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `*User Message*\n\n*Name:* ${name}\n*Username:* ${username}\n*Chat ID:* ${ctx.chat.id}\n*Message:* ${ctx.message.text}`,
      { parse_mode: 'Markdown' }
    );
  }

  try {
    if (['help', 'study', 'material', 'pdf', 'pdfs'].includes(text)) {
      await help()(ctx);
    } else {
      await greeting()(ctx);
      await pdf()(ctx);
    }
  } catch (err) {
    console.error('Error in text handler:', err);
    await forwardFailedCommand(ctx, err);
  }
});

// --- New Member Welcome (Group) ---
bot.on('new_chat_members', async (ctx) => {
  for (const member of ctx.message.new_chat_members) {
    if (member.username === ctx.botInfo.username) {
      try {
        await ctx.reply('Thanks for adding me! Type /help to get started.');
      } catch (err) {
        console.error('Error in new_chat_members handler:', err);
        await forwardFailedCommand(ctx, err);
      }
    }
  }
});

// --- Message Tracker for Private Chats ---
bot.on('message', async (ctx) => {
  const chat = ctx.chat;
  if (!chat?.id || !isPrivateChat(chat.type)) return;

  const alreadyNotified = await saveToSheet(chat);
  console.log(`Saved chat ID: ${chat.id} (${chat.type})`);

  if (chat.id !== ADMIN_ID && !alreadyNotified) {
    const user = ctx.from;
    const name = user?.first_name || 'Unknown';
    const username = user?.username ? `@${user.username}` : 'N/A';
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `*New user interacted!*\n\n*Name:* ${name}\n*Username:* ${username}\n*Chat ID:* ${chat.id}\n*Type:* ${chat.type}`,
      { parse_mode: 'Markdown' }
    );
  }
});

// --- Helper Function to Forward Failed Commands ---
async function forwardFailedCommand(ctx, error: any) {
  if (ctx.chat?.id === ADMIN_ID) return; // Don't forward admin's own messages

  const user = ctx.from;
  const name = user?.first_name || 'Unknown';
  const username = user?.username ? `@${user.username}` : 'N/A';
  const messageText = ctx.message?.text || 'N/A';
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `*Failed Command/Message*\n\n*Name:* ${name}\n*Username:* ${username}\n*Chat ID:* ${ctx.chat?.id}\n*Message:* ${messageText}\n*Error:* ${errorMessage}`,
    { parse_mode: 'Markdown' }
  );
}

// --- Vercel Export ---
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

if (ENVIRONMENT !== 'production') {
  development(bot);
}
