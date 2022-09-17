import Discord, { Intents } from 'discord.js'
import path from 'path'
import RYBot from './rybot'

const token = process.env.TOKEN ?? '';
const client_id = process.env.CLIENT_ID ?? '';


const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', () => {
    const rybot = new RYBot(client, {
        testGuilds: [process.env.GUILD ?? '', process.env.DEV_GUILD ?? ''],
        token: token,
        client_id: client_id,
        commandsDir: path.join(__dirname, '/commands').replace(/\\/g, '/'),
        featuresDir: path.join(__dirname, '/features').replace(/\\/g, '/'),
        prefix: '?'
    })
    rybot.setActivity({type: 'PLAYING', name: '🎺'});
    rybot.start();
    console.log('RYBot is online')
})

client.login(token)