const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_pnl_add_role_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        
        // Cria um menu de seleção de CARGOS nativo do Discord
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId(`select_aut_pnl_add_role_${panelId}`)
            .setPlaceholder('Selecione o cargo que deseja adicionar')
            .setMinValues(1)
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(roleSelect);

        await interaction.reply({
            content: '👇 **Selecione o cargo abaixo** para adicionar ao painel:',
            components: [row],
            ephemeral: true
        });
    }
};