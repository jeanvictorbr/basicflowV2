// handlers/buttons/dev_guild_manage_select.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_manage_select',
    async execute(interaction) {
        const guilds = Array.from(interaction.client.guilds.cache.values());

        const options = guilds.slice(0, 25).map(g => ({
            label: g.name,
            description: `ID: ${g.id}`,
            value: g.id,
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_dev_manage_guild')
            .setPlaceholder('Selecione a guilda para gerenciar')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('dev_manage_guilds').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> Selecione no menu abaixo qual guilda você deseja gerenciar." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};