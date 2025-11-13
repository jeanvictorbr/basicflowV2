const db = require('../../database');
const { getGiveawayComponents } = require('../../utils/giveawayManager'); // Importa para atualizar
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_join_',
    async execute(interaction) {
        const messageId = interaction.customId.split('_').pop();
        
        const gwResult = await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId]);
        const gw = gwResult.rows[0];

        if (!gw || gw.status !== 'active') {
            return interaction.reply({ content: '❌ Este sorteio não está mais ativo.', flags: EPHEMERAL_FLAG });
        }

        // Verifica Requisitos
        if (gw.required_roles && gw.required_roles.length > 0) {
            const hasRole = interaction.member.roles.cache.hasAny(...gw.required_roles);
            if (!hasRole) {
                const roleNames = gw.required_roles.map(r => `<@&${r}>`).join(', ');
                return interaction.reply({ 
                    content: `🔒 **Acesso Restrito**\nPara participar, você precisa de um destes cargos:\n${roleNames}`, 
                    flags: EPHEMERAL_FLAG 
                });
            }
        }

        // Já participou?
        const exists = await db.query("SELECT * FROM automations_giveaway_participants WHERE giveaway_message_id = $1 AND user_id = $2", [messageId, interaction.user.id]);
        if (exists.rows.length > 0) {
            return interaction.reply({ content: '⚠️ Você já está participando deste sorteio!', flags: EPHEMERAL_FLAG });
        }

        // Calcula Entradas
        let entries = 1;
        let bonusMsg = "";
        
        if (gw.bonus_roles) {
            for (const [roleId, bonus] of Object.entries(gw.bonus_roles)) {
                if (interaction.member.roles.cache.has(roleId)) {
                    entries += parseInt(bonus);
                    bonusMsg += `\n• <@&${roleId}> (+${bonus} chances)`;
                }
            }
        }

        // Insere
        await db.query("INSERT INTO automations_giveaway_participants (giveaway_message_id, user_id, entry_count) VALUES ($1, $2, $3)", [messageId, interaction.user.id, entries]);

        // --- ATUALIZA A MENSAGEM PÚBLICA (LIVE UPDATE) ---
        try {
            const payload = await getGiveawayComponents(gw, interaction.client);
            await interaction.message.edit(payload); // Edita a mensagem que contem o botão
        } catch (e) {
            console.error("Erro ao atualizar contador do sorteio:", e);
        }

        let replyContent = `✅ **Participação Confirmada!**\nVocê está concorrendo a **${gw.prize}**.`;
        if (entries > 1) {
            replyContent += `\n\n🔥 **Bônus Ativado!** Você tem um total de **${entries}** entradas!${bonusMsg}`;
        }
        replyContent += `\nBoa sorte! 🍀`;

        await interaction.reply({ content: replyContent, flags: EPHEMERAL_FLAG });
    }
};