// Crie em: handlers/buttons/mod_selecionar_membro.js
const { ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_selecionar_membro',
    async execute(interaction) {
        const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('select_mod_dossie_membro')
            .setPlaceholder('Selecione o membro para ver o dossiê.');

        const cancelButton = new ButtonBuilder().setCustomId('mod_open_hub').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};