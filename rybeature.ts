import { Client } from "discord.js";

export default interface RYBotFeature {
    data: {
        name: string,
        description: string
    },
    disabled?: boolean,
    start(client: Client): void
}