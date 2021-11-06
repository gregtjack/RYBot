import { Client } from "discord.js";

export default interface RYBotFeature {
    data: {
        name: string,
        description: string
    },
    enabled: boolean,
    start(client: Client): void
}