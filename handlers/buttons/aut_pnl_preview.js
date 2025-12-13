const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'aut_pnl_preview_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[3];
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];

        const embed = {
            title: panel.title,
            description: panel.description,
            color: 0x2B2D31,
            image: panel.image_url ? { url: panel.image_url } : null,
            footer: { text: 'Preview do Painel' }
        };

        const options = (panel.roles_data || []).map(r => ({
            label: r.label,
            value: r.role_id,
            emoji: r.emoji
        }));

        const components = [];
        if (options.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId('preview_dummy') // ID falso, só pra ver
                .setPlaceholder('Selecione os cargos...')
                .setMinValues(0)
                .setMaxValues(options.length)
                .addOptions(options);
            components.push(new ActionRowBuilder().addComponents(menu));
        }

        await interaction.reply({ 
            content: '👁️ **Esta é uma prévia de como ficará seu painel:**',
            embeds: [embed], 
            components: components, 
            ephemeral: true 
        });
    }
};