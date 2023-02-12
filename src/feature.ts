import { Client } from "discord.js";

export default interface Feature {
    data: {
        name: string,
        description: string
    },
    disabled?: boolean,
    start(client: Client): void
}