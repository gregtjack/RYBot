import Command from "../command";

export default {
    type: 'LEGACY',
    options: {
        name: 'ping',
        description: 'ping the bot to test uptime and latency'
    }, 
    execute: async (_interaction, _args, message) => {
        if (!message) return
        message.reply({
            content: 'Pong!'
        })
    }
} as Command;