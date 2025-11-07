// handlers/buttons/store_toggle_dm_flow.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const hasFeature = require('../../utils/featureCheck.js'); // Presumindo que você tenha o featureCheck

module.exports = {
    customId: 'store_toggle_dm_flow',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Verifica a feature premium
        const hasPremium = await hasFeature(interaction.guild.id, 'STORE_DM_FLOW');
        if (!hasPremium) {
            return interaction.followUp({ content: '❌ Esta é uma funcionalidade premium. Ative uma chave de Apoiador ou superior para usá-la.', ephemeral: true });
        }

        const settingsResult = await db.query('SELECT store_premium_dm_flow_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const newStatus = !settingsResult.rows[0]?.store_premium_dm_flow_enabled;

        await db.query('UPDATE guild_settings SET store_premium_dm_flow_enabled = $1 WHERE guild_id = $2', [newStatus, interaction.guild.id]);

        const updatedSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menuPayload = await generateConfigAdvancedMenu(interaction, updatedSettings);
        
        // --- INÍCIO DA CORREÇÃO ---
        // O erro estava aqui. O menuPayload deve ser a raiz da resposta.
        await interaction.editReply({ 
            ...menuPayload, 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
        // --- FIM DA CORREÇÃO ---
        
        await interaction.followUp({ content: `✅ Fluxo de atendimento via DM ${newStatus ? 'ativado' : 'desativado'}.`, ephemeral: true });
    }
};