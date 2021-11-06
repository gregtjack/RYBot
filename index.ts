import Discord, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import path from 'path'
import RYBot from './rybot'
dotenv.config()

const flag = process.argv.slice(2)[0]
let token = process.env.TOKEN
let client_id = process.env.CLIENT_ID
let main_guilds = ['743291806917328957']
let dev_guilds = ['697496245463154788']
let using_guilds = main_guilds

if (flag == '--dev') {
    token = process.env.DEV_TOKEN
    client_id = process.env.DEV_CLIENT_ID
    using_guilds = dev_guilds
}

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', () => {
    new RYBot(client, {
        testGuilds: using_guilds,
        token: token ?? '',
        client_id: client_id ?? '',
        commandsDir: path.join(__dirname, '/commands').replace(/\\/g, '/'),
        featuresDir: path.join(__dirname, '/features').replace(/\\/g, '/'),
        prefix: '?'
    })
    .setActivity({type: 'PLAYING', name: '🎺'})
})

client.login(token)