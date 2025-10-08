// handlers/buttons/roletags_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'roletags_remove',
    async execute(interaction) {
        const tags = (await db.query('SELECT * FROM role_tags WHERE guild_id = $1', [interaction.guild.id])).rows;

        const options = tags.map(t => ({
            label: `Tag: ${t.tag}`,
            description: `Associada ao cargo ID: ${t.role_id}`,
            value: t.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_roletags_remove')
            .setPlaceholder('Selecione a tag que deseja remover')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('open_roletags_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> Selecione a tag que deseja remover permanentemente." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};