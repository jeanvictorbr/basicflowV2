const db = require('../../database.js');
const { ActionRowBuilder, UserSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'voice_mute_menu_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();

        // Verificação de Dono (Segurança)
        const check = await db.query('SELECT owner_id FROM temp_voices WHERE channel_id = $1', [channelId]);
        if (check.rows.length === 0 || check.rows[0].owner_id !== interaction.user.id) {
            return interaction.reply({ content: "❌ Apenas o dono da sala pode gerenciar mutes.", ephemeral: true });
        }

        const select = new UserSelectMenuBuilder()
            .setCustomId(`voice_mute_select_${channelId}`)
            .setPlaceholder('Selecione quem mutar/desmutar')
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: "🔇 **Gerenciar Microfone**\nSelecione um usuário para Mutar (ou Desmutar se já estiver).",
            components: [row],
            ephemeral: true
        });
    }
};