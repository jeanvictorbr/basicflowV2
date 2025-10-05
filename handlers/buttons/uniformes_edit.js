// Crie em: handlers/buttons/uniformes_edit.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'uniformes_edit',
    async execute(interaction) {
        // Similar ao 'remove', mostra uma lista de uniformes para escolher
        const uniforms = (await db.query('SELECT id, name FROM uniforms WHERE guild_id = $1', [interaction.guild.id])).rows;
        if (uniforms.length === 0) {
            return interaction.reply({ content: 'Não há uniformes para editar.', ephemeral: true });
        }
        const options = uniforms.map(uni => ({ label: uni.name, value: String(uni.id) }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_uniformes_edit_choice').setPlaceholder('Selecione um uniforme para editar').addOptions(options);
        const cancelButton = new ButtonBuilder().setCustomId('open_uniformes_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};