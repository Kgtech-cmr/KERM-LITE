const { bot, isAdmin } = require('../lib')

bot(
  {
    pattern: 'dlt ?(.*)',
    alias: ["del"],
    desc: 'delete replied msg',
    react: "🧹",
    type: 'whatsapp',
  },
  async (message, match) => {
    if (!message.reply_message) return await message.send('*Reply to a message man*')
    const key = message.reply_message.key
    if (!key.fromMe && message.isGroup) {
      const participants = await message.groupMetadata(message.jid)
      const isImAdmin = await isAdmin(participants, message.client.user.jid)
      if (!isImAdmin) return await message.send(`_I'm not admin here idiot😑._`)
    }
    return await message.send(key, {}, 'delete')
  }
)
