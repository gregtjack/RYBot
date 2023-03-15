import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import path from "path";
import RYBotClient from "./rybot";
import dotenv from "dotenv";
import pino from "pino";
dotenv.config();

const logger = pino();
const token = extractEnvVar('TOKEN');
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.on("ready", () => {
    const devGuild = extractEnvVar('DEV_GUILD');
    const guild = extractEnvVar('GUILD');
    const bot = new RYBotClient(client, {
        testGuilds: [guild, devGuild],
        token,
        client_id: extractEnvVar('CLIENT_ID'),
        commandsDir: path.join(__dirname, "commands"),
        featuresDir: path.join(__dirname, "features"),
        legacyPrefix: '?',
    });
    bot.setActivity({ name: '🎺', type: ActivityType.Playing });
    bot.start();
    logger.info("RYBot is online");
});

function extractEnvVar(key: keyof NodeJS.ProcessEnv): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`The environment variable "${key}" cannot be undefined`);
    }
    return value;
}

if (token) {
    client.login(token);
} else {
    logger.error("No token in environment, shutting down");
    process.exit(1);
}
