const db = require('../../database.js'); // Importação obrigatória
const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'voice_kick_menu_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();

        const check = await db.query('SELECT owner_id FROM temp_voices WHERE channel_id = $1', [channelId]);
        if (check.rows.length === 0 || check.rows[0].owner_id !== interaction.user.id) {
            return interaction.reply({ content: "❌ Apenas o dono pode expulsar.", ephemeral: true });
        }

        const select = new UserSelectMenuBuilder()
            .setCustomId(`voice_kick_select_${channelId}`)
            .setPlaceholder('Selecione quem expulsar da call')
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: "Quem você deseja desconectar da sua sala?",
            components: [row],
            ephemeral: true
        });
    }
};