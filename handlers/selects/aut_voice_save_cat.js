const db = require('../../database.js');
const getVoiceUI = require('../../ui/automations/voiceMain.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_voice_save_cat',
    async execute(interaction) {
        const categoryId = interaction.values[0];
        
        // Atualiza DB
        const exists = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        if (exists.rows.length > 0) {
            await db.query('UPDATE voice_hubs SET category_id = $1 WHERE guild_id = $2', [categoryId, interaction.guild.id]);
        } else {
            await db.query('INSERT INTO voice_hubs (guild_id, category_id) VALUES ($1, $2)', [interaction.guild.id, categoryId]);
        }

        // Atualiza Painel Principal
        const res = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        const ui = getVoiceUI(res.rows[0]);
        
        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};