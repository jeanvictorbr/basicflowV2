// handlers/selects/select_roletags_add_role.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_roletags_add_role',
    async execute(interaction) {
        const roleId = interaction.values[0];
        const existingTag = (await db.query('SELECT tag FROM role_tags WHERE role_id = $1 AND guild_id = $2', [roleId, interaction.guild.id])).rows[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_roletags_submit_${roleId}`)
            .setTitle('Definir Tag para o Cargo');

        const tagInput = new TextInputBuilder()
            .setCustomId('input_tag')
            .setLabel("Tag de texto (ex: [MOD] ou 🛡️)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Insira o prefixo para este cargo.')
            .setValue(existingTag?.tag || '')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(tagInput));
        await interaction.showModal(modal);
    }
};