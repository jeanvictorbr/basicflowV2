const db = require('../../database.js');
const generateGuardianPoliciesMenu = require('../../ui/guardianPoliciesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'select_guardian_policy_remove',
    async execute(interaction) {
        await interaction.deferUpdate(); // Defer para a mensagem efêmera
        const policyId = interaction.values[0];
        await db.query('DELETE FROM guardian_policy_steps WHERE policy_id = $1', [policyId]);
        await db.query('DELETE FROM guardian_policies WHERE id = $1', [policyId]);
        await db.query('DELETE FROM guardian_infractions WHERE policy_id = $1', [policyId]);
        
        // Agora atualizamos a mensagem original do hub, não a efêmera
        const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 ORDER BY id ASC', [interaction.message.guild.id])).rows;
        await interaction.message.edit({ components: generateGuardianPoliciesMenu(policies), flags: V2_FLAG | EPHEMERAL_FLAG });
        
        // Deleta a mensagem efêmera de seleção
        await interaction.deleteReply();
    }
};