import { Context, Telegram } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';

export async function mentionAll(ctx: Context, additionalText: string) {
  if (!ctx.chat) return;

  try {
    // Fetch admins to filter them out if needed
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);
    const adminIds = admins.map(admin => admin.user.id);

    // Telegram API doesn't provide a direct way to get all members.
    // We'll use a workaround by collecting users from recent messages or a stored list.
    // For this example, we'll assume we can only fetch admins and rely on a manual list or recent interactions.
    // If you have a database of chat members, you can fetch from there.
    // Here, we'll simulate fetching members (replace with actual logic if available).
    const members: User[] = [];
    
    // Example: Fetch members from recent messages (limited approach)
    // Note: This is a workaround; Telegram's API limits non-admin member fetching.
    // You may need to maintain a member list in your `saveToSheet` or another store.
    const chatIds = await fetchChatIdsFromSheet(); // Assuming this includes group members
    for (const chatId of chatIds.filter(id => id !== ctx.from?.id && !adminIds.includes(id))) {
      try {
        const member = await ctx.telegram.getChatMember(ctx.chat.id, chatId);
        if (member.status !== 'left' && member.status !== 'kicked' && !member.user.is_bot) {
          members.push(member.user);
        }
      } catch (err) {
        console.warn(`Failed to fetch member ${chatId}:`, err);
      }
    }

    // Filter out duplicates, bots, and the admin who triggered the command
    const uniqueMembers = Array.from(
      new Map(members.map(member => [member.id, member])).values()
    ).filter(
      member => !member.is_bot && member.id !== ctx.from?.id
    );

    if (uniqueMembers.length === 0) {
      await ctx.reply('No members to mention.');
      return;
    }

    // Send mentions in batches of 5
    const batchSize = 5;
    for (let i = 0; i < uniqueMembers.length; i += batchSize) {
      const batch = uniqueMembers.slice(i, i + batchSize);
      const mentions = batch
        .map((member: User) => {
          const name = member.username ? `@${member.username}` : member.first_name;
          return `[${name}](tg://user?id=${member.id})`;
        })
        .join(' ');

      const message = additionalText ? `${mentions} ${additionalText}` : mentions;
      await ctx.reply(message, { parse_mode: 'Markdown' });
      // Add a small delay to avoid hitting Telegram's rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('Error in mentionAll:', err);
    await ctx.reply('❌ Failed to mention members.');
  }
}
