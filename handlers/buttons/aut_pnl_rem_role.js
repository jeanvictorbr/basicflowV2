const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'aut_pnl_rem_role_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];

        if (!panel.roles_data || panel.roles_data.length === 0) {
            return interaction.reply({ content: '❌ Não há cargos para remover.', ephemeral: true });
        }

        // Cria menu com os cargos JÁ existentes no painel
        const options = panel.roles_data.map((r, index) => ({
            label: r.label,
            description: `ID: ${r.role_id}`,
            value: index.toString(), // Usamos o índice do array para remover
            emoji: '🗑️'
        })).slice(0, 25);

        const select = new StringSelectMenuBuilder()
            .setCustomId(`select_aut_pnl_rem_${panelId}`)
            .setPlaceholder('Selecione o cargo para remover')
            .addOptions(options);

        await interaction.reply({
            content: '🗑️ Selecione qual item deseja remover do painel:',
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    }
};