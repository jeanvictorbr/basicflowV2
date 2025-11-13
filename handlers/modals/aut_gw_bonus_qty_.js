const db = require('../../database');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_bonus_qty_',
    async execute(interaction) {
        // ID vem como: aut_gw_bonus_qty_MESSAGEID_ROLEID
        const parts = interaction.customId.split('_');
        const roleId = parts.pop();
        const messageId = parts.pop();
        
        const qty = parseInt(interaction.fields.getTextInputValue('quantity'));

        if (isNaN(qty) || qty < 0) {
            return interaction.reply({ content: "❌ Por favor, insira um número válido (0 ou maior).", flags: EPHEMERAL_FLAG });
        }

        // Atualiza o JSONB no banco
        const gw = (await db.query("SELECT bonus_roles FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
        let bonuses = gw.bonus_roles || {};

        if (qty === 0) {
            delete bonuses[roleId];
        } else {
            bonuses[roleId] = qty;
        }

        await db.query("UPDATE automations_giveaways SET bonus_roles = $1 WHERE message_id = $2", [bonuses, messageId]);

        await interaction.reply({ 
            content: qty === 0 
                ? `✅ Bônus para o cargo <@&${roleId}> removido.` 
                : `✅ Cargo <@&${roleId}> agora dá **+${qty}** entradas extras!`, 
            flags: EPHEMERAL_FLAG 
        });
    }
};