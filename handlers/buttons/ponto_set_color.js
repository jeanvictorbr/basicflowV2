const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_set_color',
    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ponto_color')
            .setPlaceholder('Escolha uma cor para a vitrine')
            .addOptions(
                { label: 'Padrão (Verde)', value: '#11806A', emoji: '🟢' },
                { label: 'Azul', value: '#3498DB', emoji: '🔵' },
                { label: 'Vermelho', value: '#E74C3C', emoji: '🔴' },
                { label: 'Roxo', value: '#9B59B6', emoji: '🟣' },
                { label: 'Dourado', value: '#F1C40F', emoji: '🟡' }
            );
        const cancelButton = new ButtonBuilder().setCustomId('ponto_open_premium_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};