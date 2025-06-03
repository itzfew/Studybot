import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:pdf_handler');

// Map command keywords to message IDs
const messageMap: Record<string, number> = {
  'mtg-rapid-physics': 3,
  'mtg-rapid-chemistry': 5,
  'mtg-rapid-biology': 4,
  // ... (other mappings as provided in your original question)
};

const fileStorageChatId = -1002481747949;

const handlePdfCommand = async (ctx: Context, keyword: string) => {
  if (!messageMap[keyword]) {
    await ctx.reply('Sorry, the requested file was not found. Please check the keyword or contact @NeetAspirantsBot for assistance.');
    return;
  }

  debug(`Handling PDF command for: ${keyword}`);

  await ctx.reply('Here is your file. Save or forward it to keep it — this message will not be stored permanently.');

  try {
    // Remove reply_to_message_id or use type assertion if needed
    await ctx.telegram.copyMessage(
      ctx.chat!.id,
      fileStorageChatId,
      messageMap[keyword]
      // Removed reply_to_message_id to avoid type error
      // If reply_to_message_id is critical, use type assertion:
      // { reply_to_message_id: ctx.message?.message_id } as any
    );
  } catch (err) {
    console.error('Error copying message:', err);
    await ctx.reply('Failed to fetch the file. Please try again later or contact @NeetAspirantsBot.');
  }
};

const pdf = () => async (ctx: Context) => {
  try {
    const message = ctx.message;

    // Handle /start with deep link or plain text commands
    if (message && 'text' in message) {
      const text = message.text.trim();
      let keyword = '';

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          keyword = parts[1].toLowerCase();
        } else {
          await ctx.reply('Please provide a valid keyword. Example: /start mtg-rapid-physics');
          return;
        }
      } else {
        keyword = text.toLowerCase();
      }

      if (!keyword) {
        await ctx.reply('No keyword provided. Please send a valid keyword or use /start <keyword>.');
        return;
      }

      await handlePdfCommand(ctx, keyword);
    }
  } catch (err) {
    console.error('PDF command handler error:', err);
    await ctx.reply('An error occurred while fetching your file. Please contact @NeetAspirantsBot for assistance.');
  }
};

export { pdf, messageMap, handlePdfCommand };
