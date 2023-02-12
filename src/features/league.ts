import { Utils } from "discord-api-types";
import { Client } from "discord.js";
import RYBotFeature from "../feature";

export default {
    data: {
        name: '',
        description: 'Will ban* anyone who plays League for more than 30 minutes.\n\n\n\n\n*jk haha.. unless'
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
} as RYBotFeature