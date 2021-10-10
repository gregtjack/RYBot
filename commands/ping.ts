import RYBotCommand from "../rybommand";

export default {
    type: 'LEGACY',
    data: {
        name: 'ping',
        description: 'ping the bot to test uptime and latency'
    },
    
    execute: async (interaction, args, message) => {
        if (!message) return
        message.reply({
            content: 'Pong!'
        })
    }
    
} as RYBotCommand