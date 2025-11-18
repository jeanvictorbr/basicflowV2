// Local: handlers/modals/modal_mass_transfer_global_.js
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const db = require('../../database');
const { decrypt } = require('../../utils/encryption');

module.exports = {
    customId: 'modal_mass_transfer_global_', 
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        const confirmation = interaction.fields.getTextInputValue('confirmation');
        if (confirmation.toUpperCase() !== 'CONFIRMAR') return interaction.editReply('❌ Ação cancelada.');

        const qtyInput = interaction.fields.getTextInputValue('quantity').trim().toUpperCase();
        let limit = null;
        if (qtyInput !== 'ALL') {
            limit = parseInt(qtyInput);
            if (isNaN(limit) || limit <= 0) return interaction.editReply('❌ Quantidade inválida.');
        }

        const targetGuildId = interaction.customId.split('_').pop();
        const guild = await interaction.client.guilds.fetch(targetGuildId).catch(() => null);
        if (!guild) return interaction.editReply('❌ Servidor inacessível.');

        // Busca Tokens (Global)
        let query = `SELECT DISTINCT ON (user_id) user_id, access_token FROM cloudflow_verified_users WHERE access_token IS NOT NULL ORDER BY user_id, verified_at DESC`;
        const params = [];
        if (limit) { query += ' LIMIT $1'; params.push(limit); }

        const { rows: users } = await db.query(query, params);
        if (users.length === 0) return interaction.editReply('❌ Sem usuários verificados.');

        await interaction.editReply(`🚀 Puxando **${users.length}** membros para **${guild.name}**...`);

        let s = 0, f = 0, a = 0;
        for (const u of users) {
            try {
                if (guild.members.cache.has(u.user_id)) { a++; continue; }
                const t = decrypt(u.access_token);
                if (!t) { f++; continue; }
                await guild.members.add(u.user_id, { accessToken: t });
                s++;
                await new Promise(r => setTimeout(r, 1200));
            } catch (e) { f++; }
        }

        await interaction.followUp({ content: `✅ **Fim!**\nSucesso: ${s} | Já no server: ${a} | Falhas: ${f}`, flags: EPHEMERAL_FLAG });
    },
};