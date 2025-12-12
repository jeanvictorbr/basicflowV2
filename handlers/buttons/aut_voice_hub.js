const db = require('../../database.js');
const getVoiceUI = require('../../ui/automations/voiceMain.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_voice_hub',
    async execute(interaction) {
        const res = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        const ui = getVoiceUI(res.rows[0]); // Passa a config se existir
        
        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};