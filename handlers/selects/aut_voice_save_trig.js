const db = require('../../database.js');
const getVoiceUI = require('../../ui/automations/voiceMain.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_voice_save_trig',
    async execute(interaction) {
        const channelId = interaction.values[0];

        // Upsert simplificado
        const exists = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        if (exists.rows.length > 0) {
            await db.query('UPDATE voice_hubs SET trigger_channel_id = $1 WHERE guild_id = $2', [channelId, interaction.guild.id]);
        } else {
            await db.query('INSERT INTO voice_hubs (guild_id, trigger_channel_id) VALUES ($1, $2)', [interaction.guild.id, channelId]);
        }

        // Confirmação V2
        await interaction.update({
            components: [{ type: 10, content: `✅ **Configurado!** O canal <#${channelId}> agora é um Hub de Voz.`, style: 1 }],
            flags: V2_FLAG
        });
    }
};