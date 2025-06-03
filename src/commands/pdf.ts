import { Context } from 'telegraf';
import { InlineQueryResultArticle } from 'telegraf/types'; // Import from telegraf/types
import createDebug from 'debug';
import pdfData from '../pdf.json';

const debug = createDebug('bot:pdf_handler');

// Map command keywords to message IDs
const messageMap: Record<string, number> = {
  'mtg-rapid-physics': 3,
  'mtg-rapid-chemistry': 5,
  'mtg-rapid-biology': 4,
  'pw-37years-pyqs-physics': 6,
  'pw-37years-pyqs-chemistry': 7,
  'pw-37years-pyqs-biology': 8,
  'pw-12years-pyqs-physics': 9,
  'pw-12years-pyqs-chemistry': 10,
  'pw-12years-pyqs-biology': 11,
  'mtg-37years-pyqs-physics': 12,
  'mtg-37years-pyqs-chemistry': 13,
  'mtg-37years-pyqs-biology': 14,
  'mtg-fingertips-new-physics': 15,
  'mtg-fingertips-new-chemistry': 16,
  'mtg-fingertips-new-biology': 17,
  'rakshita-singh-37years-physics': 18,
  'rakshita-singh-37years-chemistry': 19,
  'rakshita-singh-37years-bio11th': 20,
  'mtg-biology-today': 21,
  'mtg-physics-today': 22,
  'mtg-chemistry-today': 23,
  'mtg-mathematics-today': 24,
  'physics-med-easy-2.0': 25,
  'chemistry-med-easy': 26,
  'zoology-med-easy': 27,
  'botany-med-easy': 28,
  'pw-vidyapeeth-mind-map': 29,
  '23years-jee-pyqs-physics': 30,
  'pw-6years-jee-pyqs-physics': 31,
  'pw-6years-jee-pyqs-chemistry': 32,
  'pw-6years-jee-pyqs-maths': 33,
  'ncert-nichod-chemistry': 34,
  'ncert-nichod-physics': 35,
  'ncert-nichod-biology': 36,
  'master-the-ncert-bio-11th': 37,
  'master-the-ncert-bio-12th': 38,
  'disha-144-jee-mains-physics': 39,
  'disha-144-jee-mains-chemistry': 40,
  'dcpandey-objective-full': 42,
  'dcpandey-volume1': 43,
  'dcpandey-volume2': 44,
  'inorganic-chemistry-module': 45,
  'organic-chemistry-module': 46,
  'physical-chemistry-module': 47,
  'biology-module-11th': 48,
  'biology-module-12th': 49,
  'physics-module-12th': 50,
  'physics-module-11th': 51,
  'ncert-exemplar-chemistry-11': 52,
  'ncert-exemplar-chemistry-12': 53,
  'ncert-exemplar-physics-11': 54,
  'ncert-exemplar-physics-12': 55,
  'ncert-exemplar-biology-11': 56,
  'ncert-exemplar-biology-12': 57,
  'organic-chemistry-word-to-word': 58,
  'biology-word-to-word': 59,
  'inorganic-chemistry-word-to-word': 60,
  'arihant-physics-handbook': 61,
  'arihant-mathematics-handbook': 62,
  'arihant-chemistry-handbook': 63,
  'view-more-study-material': 64,
  '10-full-syllabus-mock-anand': 65,
  'akash-modules': 66,
  'allen-modules': 67,
  'allen-11-years-pyq': 68,
  'ncert-punch-biology': 69,
  'ncert-punch-chemistry': 70,
  'ncert-punch-physics': 71,
  'competishun-jee-maths-5yr-pyq': 72,
  'competishun-jee-chemistry-5yr-pyq': 73,
  'competishun-jee-physics-5yr-pyq': 74,
  'pw-pyq-physics-11': 75,
  'pw-pyq-physics-12': 76,
  'pw-pyq-organic-chemistry': 77,
  'pw-pyq-inorganic-chemistry': 78,
  'pw-pyq-physical-chemistry': 79,
  'pw-pyq-biology-11': 80,
  'pw-pyq-biology-12': 81,
  'arihant-pyq-biology': 82,
  'arihant-pyq-physics': 83,
  'arihant-pyq-chemistry': 84,
  'allen-physics-handbook': 85,
  'allen-chemistry-handbook': 86,
  'allen-biology-handbook': 87,
  'allen-maths-handbook': 88,
  'mohit-bhargava-physics-12th-1': 89,
  'mohit-bhargava-physics-12th-2': 90,
  'gurukul-oswal-objective-iit-jee': 91,
  'neet-crash-pw-45-days-physics': 92,
  'NEET-crash-pw-45-days-biology': 93,
  'neet-crash-pw-45-days-chemistry': 94,
  'bansal-classes-chemistry-theory': 95,
  'Bansal-classes-math-questions': 96,
  'bansal-classes-physics-booklet': 97,
  'bansal-classes-physics-material': 98,
  'bansal-classes-math-theory': 99,
  'bansal-classes-chemistry-booklet-1': 100,
  'bansal-classes-organic-chemistry-1': 101,
  'bansal-classes-chemistry-booklet-2': 102,
  'bansal-classes-organic-chemistry-2': 103,
  'bansal-classes-physics-theory': 104,
  'iit-kalrashukla-jee-advanced-problems-1-6': 105,
  'IIT-kalrashukla-jee-advanced-problems-7-12': 106,
  'iit-kalrashukla-jee-advanced-problems-13-19': 107,
  'oswaal-math': 108,
  'Oswaal-physics': 109,
  'oswaal-chemistry': 110,
  'narayana-jee-advanced-test': 111,
  'aakash-zoology-ncert-map': 112,
  'aakash-botany-ncert-map': 113,
  'Aakash-physics-ncert-map': 114,
  'aakash-chemistry-ncert-map': 115,
  'rd-sharma-11th': 116,
  'rd-sharma-12th-2': 117,
  'rd-sharma-12th-1': 118,
  'arihant-40-days-crash-jee-mains-physics': 119,
  'Arihant-40-days-crash-jee-mains-chemistry': 120,
  'arihant-40-days-crash-jee-mains-mathematics': 121,
  'motion-classes-maths-module': 122,
  'motion-iit-chemistry-module': 123,
  'motion-classes-physics-module': 124,
  'motion-final-revision-module': 125,
  'motion-revision-module-physics': 126,
  'motion-revision-module-chemistry': 127,
  'motion-revision-module-mathematics': 128,
  'disha-360-biology-seep-pahuja': 129,
  'rs-aggarwal-mathematics': 130,
  'sl-arora-physics-vol-1': 131,
  'sl-arora-physics-vol-2': 132,
  'mtg-19-years-jee-mains-mathematics': 133,
  'vedantu-tatva-math-vol-1': 134,
  'vedantu-tatva-math-vol-2': 135,
  'vedantu-tatva-math-vol-3': 136,
  'vedantu-tatva-physics-vol-1': 137,
  'vedantu-tatva-physics-vol-2': 138,
  'vedantu-tatva-physics-vol-3': 139,
  'vedantu-tatva-physics-vol-4': 140,
  'vedantu-tatva-chemistry-vol-1': 141,
  'vedantu-tatva-chemistry-vol-2': 142,
  'vedantu-tatva-chemistry-vol-3': 143,
  'vedantu-tatva-chemistry-vol-4': 144,
  'disha-ncert-xtract-chemistry': 145,
  'disha-ncert-xtract-biology': 146,
  'disha-ncert-xtract-physics': 147,
  'vedantu-tatva-biology-vol-1': 148,
  'vedantu-tatva-biology-vol-2': 149,
  'vedantu-tatva-biology-vol-3': 150,
  'vedantu-tatva-biology-vol-4': 151,
  'vedantu-tatva-biology-vol-5': 152,
  'vedantu-tatva-biology-vol-6': 153,
  'disha-36-years-pyq-biology-11': 154,
  'disha-36-years-pyq-biology-12': 155,
  'disha-36-years-pyq-chemistry-11': 156,
  'disha-36-years-pyq-chemistry-12': 157,
  'disha-36-years-pyq-physics-11': 158,
  'disha-36-years-pyq-physics-12': 159,
  'mtg-36-years-pyq-biology-11': 160,
  'mtg-36-years-pyq-biology-12': 161,
  'mtg-36-years-pyq-chemistry-11': 162,
  'mtg-36-years-pyq-chemistry-12': 163,
  'mtg-36-years-pyq-physics-11': 164,
  'akash-diagrams-1': 165,
  'akash-diagrams-2': 166,
  'pw-module-physical-chemistry': 167,
  'pw-module-biology-11': 168,
  'pw-module-physics-12': 169,
  'pw-module-inorganic-chemistry': 170,
  'pw-module-biology-12': 171,
  'pw-module-organic-chemistry': 172,
  'pw-module-physics-11': 173,
  'arjuna-chemistry-1': 174,
  'arjuna-chemistry-2': 175,
  'arjuna-zoology': 176,
  'arjuna-physics': 177,
  'arjuna-chemistry-3': 178,
  'arjuna-botany': 179,
  'arjuna-botany-1': 180,
  'arjuna-zoology-2': 181,
  'arjuna-botany-2': 182,
  'arjuna-chemistry-1-hindi': 183,
  'arjuna-chemistry-2-hindi': 184,
  'arjuna-chemistry-3-hindi': 185,
  'arjuna-physics-1-hindi': 186,
  'arjuna-physics-2-hindi': 187,
  'arjuna-physics-3-hindi': 188,
  'arjuna-physics-4-hindi': 189,
  'arjuna-physics-5-hindi': 190,
  'arjuna-zoology-1-hindi': 191,
  'arjuna-zoology-3-hindi': 192,
  'arjuna-zoology-4-hindi': 193,
  'arjuna-botany-1-hindi': 194,
  'arjuna-zoology-2-hindi': 195,
  'arjuna-botany-2-hindi': 196,
  'arjuna-botany-3-hindi': 197,
  'arjuna-botany-4-hindi': 198,
  'lakshya-zoology': 199,
  'lakshya-botany': 200,
  'lakshya-physics': 201,
  'lakshya-chemistry': 202,
};

const fileStorageChatId = -1002481747949;

// Handle PDF command for direct messages
const handlePdfCommand = async (ctx: Context, keyword: string) => {
  if (!messageMap[keyword]) {
    await ctx.reply('Invalid keyword. Please use /help to see available materials.');
    return;
  }

  debug(`Handling PDF command for: ${keyword}`);

  await ctx.reply('Here is your file. Save or forward it to keep it — this message will not be stored permanently.');

  await ctx.telegram.copyMessage(
    ctx.chat!.id,
    fileStorageChatId,
    messageMap[keyword]
  );
};

// Handle inline queries
const handleInlineQuery = async (ctx: Context) => {
  const query = ctx.inlineQuery?.query?.toLowerCase().trim() || '';
  debug(`Handling inline query: ${query}`);

  // Flatten pdfData to a list of items for easier filtering
  const allItems = pdfData.flatMap((category: any) =>
    category.items.map((item: any) => ({
      label: item.label,
      key: item.key,
      category: category.title,
    }))
  );

  // Filter items based on query
  const results = allItems
    .filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    )
    .slice(0, 50) // Telegram limits to 50 results
    .map((item, index): InlineQueryResultArticle => ({
      type: 'article',
      id: `${index}-${item.key}`,
      title: item.label,
      description: `From ${item.category}`,
      input_message_content: {
        message_text: `/start ${item.key}`,
      },
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Get PDF',
            callback_data: `get_pdf_${item.key}`,
          },
        ]],
      },
    }));

  await ctx.answerInlineQuery(results, {
    cache_time: 0, // Ensure fresh results
  });
};

// Main pdf command handler
const pdf = () => async (ctx: Context) => {
  try {
    // Handle inline queries
    if (ctx.inlineQuery) {
      await handleInlineQuery(ctx);
      return;
    }

    const message = ctx.message;

    // Handle /start with deep link
    if (message && 'text' in message && message.text.startsWith('/start')) {
      const parts = message.text.trim().split(' ');
      if (parts.length > 1) {
        const keyword = parts[1].toLowerCase();
        await handlePdfCommand(ctx, keyword);
        return;
      }
    }

    // Handle plain text commands
    if (message && 'text' in message) {
      const keyword = message.text.trim().toLowerCase();
      await handlePdfCommand(ctx, keyword);
    }
  } catch (err) {
    console.error('PDF command handler error:', err);
    await ctx.reply('An error occurred while fetching your file. Please contact @NeetAspirantsBot for assistance and try again later.');
  }
};

// Handle callback queries for inline mode
const handleCallbackQuery = async (ctx: Context) => {
  const callback = ctx.callbackQuery;
  if (!callback || !('data' in callback)) {
    await ctx.answerCbQuery('Invalid callback data.');
    return;
  }

  const data = callback.data;
  if (data.startsWith('get_pdf_')) {
    const keyword = data.replace('get_pdf_', '');
    if (messageMap[keyword]) {
      if (!ctx.from) {
        await ctx.answerCbQuery('Unable to send file: User not found.');
        return;
      }
      await ctx.telegram.sendMessage(
        ctx.from.id,
        'Here is your file. Save or forward it to keep it — this message will not be stored permanently.'
      );
      await ctx.telegram.copyMessage(
        ctx.from.id,
        fileStorageChatId,
        messageMap[keyword]
      );
      await ctx.answerCbQuery('File sent to your chat!');
    } else {
      await ctx.answerCbQuery('Invalid file request.');
    }
  }
};

export { pdf, handleCallbackQuery };
