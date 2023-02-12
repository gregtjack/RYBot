import Discord, { ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

export default class ConfirmationDialogue {

    private interaction: Discord.CommandInteraction
    private seconds: number

    /**
     * Creates a new Confirmation Dialogue
     * @param interaction Interaction
     * @param channel Text Channel
     * @param seconds Seconds to check for a response
     */
    constructor(interaction: Discord.CommandInteraction, seconds: number = 60) {
        this.interaction = interaction
        
        this.seconds = seconds
    }

    /**
     * Send the Dialogue to the user
     * @param message Custom message to show the user
     */
    public async send(message: string = 'Are you sure?'): Promise<boolean> {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([               
                new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary)
            ])
        await this.interaction.reply({
            content: message,
            components: [row],
            ephemeral: true
        });

        const collector = this.interaction?.channel?.createMessageComponentCollector({
            max: 1,
            time: 1000 * this.seconds
        });
    
        return new Promise((resolve, reject) => {
            collector?.on('end', (collection) => {
                collection.forEach((click) => {
                    if (click.customId === 'confirm') {
                        this.interaction.editReply({
                            content: 'Confirmed',
                            components: []
                        });
                        resolve(true);
                    } else {
                        this.interaction.editReply({
                            content: 'Cancelled',
                            components: []
                        });
                        reject('cancelled');
                    }
                })
            });
        })
    }
}
