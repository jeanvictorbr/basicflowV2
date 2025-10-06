const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_set_cargo_servico',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_ponto_cargo_servico').setPlaceholder('Selecione o cargo para quem está em serviço');
        const cancelButton = new ButtonBuilder().setCustomId('open_ponto_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};