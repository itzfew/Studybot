import { Context, Markup } from 'telegraf';
import createDebug from 'debug';

// Define the structure of pdf.json
interface PdfItem {
  label: string;
  key: string;
}

interface PdfCategory {
  title: string;
  items: PdfItem[];
}

const pdfData: PdfCategory[] = require('../pdf.json'); // Import pdf.json with type
const debug = createDebug('bot:help_command');
const ITEMS_PER_PAGE = 4;

// Escape MarkdownV2 special characters
const escape = (text: string): string =>
  text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');

const help = () => async (ctx: Context) => {
  await sendPage(ctx, 0, false);
};

const sendPage = async (ctx: Context, page: number, edit = false) => {
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const section = pdfData.slice(start, end);

  let message = `*♡ 𝐓𝐄𝐀𝐌 EDUHUB\\-KMR 𝐂𝐇𝐄𝐂𝐊𝐋𝐈𝐒𝐓 ॐ*\n────────┉┈◈◉◈┈┉───────\n`;

  for (const block of section) {
    message += `*ꕥ ${escape(block.title)}*\n`;
    for (const item of block.items) {
      // Ensure item.key is a string (type is guaranteed by PdfItem interface)
      message += `➥ [${escape(item.label)}](https://t.me/Material_eduhubkmrbot?start=${item.key})\n`;
    }
    message += `────────┉┈◈◉◈┈┉───────\n`;
  }

  const keyboard = [];

  if (page > 0) {
    keyboard.push([{ text: '⬅ Previous', callback_data: `help_page_${page - 1}` }]);
  }
  if (end < pdfData.length) {
    keyboard.push([{ text: 'Next ➡', callback_data: `help_page_${page + 1}` }]);
  }

  const markup = Markup.inlineKeyboard(keyboard).reply_markup;

  if (edit && 'editMessageText' in ctx) {
    await ctx.editMessageText(message, {
      parse_mode: 'MarkdownV2',
      reply_markup: markup,
    });
  } else {
    await ctx.reply(message, {
      parse_mode: 'MarkdownV2',
      reply_markup: markup,
    });
  }
};

const handleHelpPagination = () => async (ctx: Context) => {
  const callbackQuery = ctx.callbackQuery;

  if (callbackQuery && 'data' in callbackQuery) {
    const match = callbackQuery.data.match(/help_page_(\d+)/);
    if (!match) return;

    const page = parseInt(match[1], 10);
    await ctx.answerCbQuery();
    await sendPage(ctx, page, true); // true = edit mode
  }
};

export { help, handleHelpPagination };
