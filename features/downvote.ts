import { Client } from "discord.js";
import RYBotFeature from "../rybeature";

export default {
    data: {
        name: 'Downvote',
        description: 'Example feature: reacts with a downvote for every message lol'
    },
    disabled: true,
    start(client: Client) {
        client.on('messageCreate', async message => {
            await message.react('👎')
        })
    }
} as RYBotFeature