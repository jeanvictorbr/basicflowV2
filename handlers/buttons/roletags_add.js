// handlers/buttons/roletags_add.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'roletags_add',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId('select_roletags_add_role')
            .setPlaceholder('Selecione o cargo para adicionar ou editar a tag');

        const cancelButton = new ButtonBuilder().setCustomId('open_roletags_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> **Passo 1 de 2:** Selecione o cargo no menu abaixo." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};