import { ActivityType, Client, GatewayIntentBits } from 'discord.js'
import path from 'path'
import RYBotClient from './rybot'
import dotenv from 'dotenv'
import pino from 'pino'
dotenv.config()

const logger = pino();
const token = process.env.TOKEN;
const client_id = process.env.CLIENT_ID ?? '';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.GuildPresences
    ]
})

client.on('ready', () => {
    const devGuild = process.env.DEV_GUILD ?? '';
    const guild = process.env.GUILD ?? '';
    const rybot = new RYBotClient(client, logger, {
        testGuilds: [guild, devGuild],
        token: token ?? '',
        client_id: client_id ?? '',
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'features'),
        prefix: '?'
    })
    rybot.setActivity({ name: "🎺", type: ActivityType.Playing });
    rybot.start();
    logger.info('RYBot is online');
})

if (token) {
    client.login(token);
} else {
    logger.error('No token in environment, shutting down')
    process.exit(1);
}