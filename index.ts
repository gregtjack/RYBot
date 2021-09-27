import Discord, { Intents } from 'discord.js'
import WOKCommands from 'wokcommands'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', () => {
    const wok = new WOKCommands(client, {
      // The name of the local folder for your command files
      commandsDir: path.join(__dirname, 'commands'),
      // Allow importing of .ts files if you are using ts-node
      typeScript: true,
      testServers: ['697496245463154788', '891807820545151007'],
    })
    .setBotOwner(['130317861183946753'])
    .setDisplayName('RYBot')
    .setDefaultPrefix('!')
    .setColor('#d4ae04')
    //const { commandHandler } = wok
    console.log("Ready!")
})

client.login(process.env.TOKEN)