import Discord, { ButtonInteraction, MessageActionRow, MessageButton } from 'discord.js'

export default class ConfirmationDialogue {

    private interaction: Discord.CommandInteraction
    private channel: Discord.TextChannel
    private time: number

    /**
     * Creates a new Confirmation Dialogue
     * @param interaction Interaction
     * @param channel Text Channel
     * @param time Time in seconds to check for a response
     */
    constructor(interaction: Discord.CommandInteraction, channel: Discord.TextChannel, time: number = 30) {
        this.interaction = interaction
        this.channel = channel
        this.time = time
    }

    /**
     * Send the Dialogue to the user
     * @param message Custom message to show the user
     */
    public async send(message: string = 'Are you sure?', callback: (status: number, click: Discord.ButtonInteraction) => void) {
        const row = new MessageActionRow()
            .addComponents([               
                new MessageButton()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(Discord.Constants.MessageButtonStyles.SUCCESS),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(Discord.Constants.MessageButtonStyles.DANGER)
            ])
        await this.interaction.reply({
            content: message,
            components: [row],
            ephemeral: true
        })

        const filter = (btnInt: ButtonInteraction) => {
            return this.interaction.user.id === btnInt.user.id
        }

        const collector = this.channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 1000 * this.time
        })

        collector.on('end', (collection) => {
            collection.forEach((click) => {
                if (click.customId === 'confirm') {
                    callback(Discord.Constants.MessageButtonStyles.SUCCESS, click)
                }
            })
        })
    }
}
