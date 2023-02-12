import { Client } from "discord.js";
import { Feature } from "../rybot.types";

export default {
    data: {
        name: '',
        description: 'Will ban anyone who plays League for more than 30 minutes'
    },
    disabled: true,
    start(client: Client) {
        const rybiscord = '743291806917328957'
        const seconds = 3
        // Check for League of Legends activity
        setTimeout(() => {
            console.log('Searching')
            console.log(client.guilds.cache.get(rybiscord)
                ?.presences)
        }, seconds * 1000)
    }
} as Feature