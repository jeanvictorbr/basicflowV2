const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_save_log_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_save_log_')[1];
        const channelId = interaction.values[0];

        await db.query('UPDATE forms_templates SET log_channel_id = $1 WHERE guild_id = $2 AND custom_id = $3', [channelId, interaction.guild.id, customId]);

        // Feedback + Update UI original se possível (mas como é reply de reply, mandamos nova confirmação ou tentamos editar o painel se tivermos referencia, mas aqui simplificamos)
        await interaction.update({ 
            components: [{ type: 10, content: `✅ Canal de Logs definido para <#${channelId}>! Volte ao painel principal para ver a mudança.`, style: 1 }], 
            flags: V2_FLAG 
        });
    }
};