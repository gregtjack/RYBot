import { ICommand } from 'wokcommands'

export default {
  category: 'general',
  description: 'RYB', // Required for slash commands
  
  slash: 'both', // Create both a slash and legacy command
  testOnly: true, // Only register a slash command for the testing guilds
  
  callback: ({}) => {
    return '🎺'
  }
} as ICommand