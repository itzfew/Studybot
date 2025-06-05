import { Context } from 'telegraf';

export async function mentionAll(ctx: Context, additionalText: string) {
  if (!ctx.chat) return;

  try {
    // Fetch all chat members
    const members = await ctx.telegram.getChatMembersCount(ctx.chat.id);
    let allMembers: { id: number; first_name: string; username?: string }[] = [];
    let offset = 0;
    const limit = 100; // Telegram API limit per request

    // Fetch members in batches
    while (offset < members) {
      const chatMembers = await ctx.telegram.getChatAdministrators(ctx.chat.id).catch(() => []);
      const nonAdminMembers = await ctx.telegram.getChatMembers(ctx.chat.id, { offset, limit }).catch(() => []);
      allMembers = [
        ...allMembers,
        ...chatMembers.map(member => ({
          id: member.user.id,
          first_name: member.user.first_name,
          username: member.user.username,
        })),
        ...nonAdminMembers.map(member => ({
          id: member.user.id,
          first_name: member.user.first_name,
          username: member.user.username,
        })),
      ];
      offset += limit;
    }

    // Filter out duplicates, bots, and the admin who triggered the command
    const uniqueMembers = Array.from(
      new Map(allMembers.map(member => [member.id, member])).values()
    ).filter(
      member => !member.username?.includes('bot') && member.id !== ctx.from?.id
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
        .map(member => {
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
