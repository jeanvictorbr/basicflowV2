const db = require('../../database');
const { getGiveawayComponents } = require('../../utils/giveawayManager');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_leave_',
    async execute(interaction) {
        const messageId = interaction.customId.split('_').pop();

        // Verifica se o sorteio existe
        const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
        if (!gw) return interaction.reply({ content: '❌ Sorteio não encontrado.', flags: EPHEMERAL_FLAG });

        // Verifica se está participando
        const check = await db.query("DELETE FROM automations_giveaway_participants WHERE giveaway_message_id = $1 AND user_id = $2", [messageId, interaction.user.id]);

        if (check.rowCount === 0) {
            return interaction.reply({ content: '❌ Você não está participando deste sorteio.', flags: EPHEMERAL_FLAG });
        }

        // --- ATUALIZA A MENSAGEM PÚBLICA (LIVE UPDATE) ---
        try {
            const payload = await getGiveawayComponents(gw, interaction.client);
            await interaction.message.edit(payload);
        } catch (e) {
            console.error("Erro ao atualizar contador do sorteio (leave):", e);
        }

        await interaction.reply({ 
            content: '🗑️ **Você saiu do sorteio.**\nSuas entradas foram removidas.', 
            flags: EPHEMERAL_FLAG 
        });
    }
};