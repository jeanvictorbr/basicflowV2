// handlers/selects/select_mod_revogar_punicao.js
const db = require('../../database.js');
const { getActiveSanctions } = require('../buttons/mod_ver_punicoes_ativas.js');
const generateModeracaoPunicoesAtivasMenu = require('../../ui/moderacaoPunicoesAtivasMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_revogar_punicao',
    async execute(interaction) {
        await interaction.deferUpdate();
        const [type, id] = interaction.values[0].split('_');

        try {
            const reason = `Revogada por: ${interaction.user.tag}`;
            let successMessage = '';

            if (type === 'punishment') {
                const log = (await db.query('SELECT * FROM moderation_logs WHERE case_id = $1 AND guild_id = $2', [id, interaction.guild.id])).rows[0];
                if (!log) throw new Error('Punição não encontrada.');

                if (log.action === 'TIMEOUT') {
                    const member = await interaction.guild.members.fetch(log.user_id).catch(() => null);
                    if (member) await member.timeout(null, reason);
                } else if (log.action === 'BAN') {
                    await interaction.guild.members.unban(log.user_id, reason);
                }
                
                await db.query('DELETE FROM moderation_logs WHERE case_id = $1', [id]);
                successMessage = `✅ Punição #${id} revogada com sucesso!`;

            } else if (type === 'infraction') {
                const [userId, policyId] = id.split('_');
                await db.query('DELETE FROM guardian_infractions WHERE user_id = $1 AND policy_id = $2 AND guild_id = $3', [userId, policyId, interaction.guild.id]);
                successMessage = `✅ Infração do usuário <@${userId}> resetada com sucesso!`;
            }

            await interaction.followUp({ content: successMessage, ephemeral: true });

        } catch (error) {
            console.error(`[REVOKE] Erro ao revogar sanção ${interaction.values[0]}:`, error);
            await interaction.followUp({ content: '❌ Ocorreu um erro. A sanção pode já ter sido revogada ou expirado.', ephemeral: true });
        }
        
        // Atualiza a lista
        const activeSanctions = await getActiveSanctions(interaction.guild.id);
        await interaction.editReply({
            components: generateModeracaoPunicoesAtivasMenu(activeSanctions, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};