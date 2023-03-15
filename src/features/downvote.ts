import { Client, Events } from "discord.js";
import { Feature } from "../rybot.types";

export default {
    name: 'Downvote',
    description: 'Example feature: reacts with a downvote for every message lol',
    disabled: true,
    start(client: Client) {
        client.on(Events.MessageCreate, async message => {
            await message.react('👎')
        })
    }
} as Feature