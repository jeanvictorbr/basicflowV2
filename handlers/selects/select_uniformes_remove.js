// Crie em: handlers/selects/select_uniformes_remove.js
const db = require('../../database.js');
const generateUniformesMenu = require('../../ui/uniformesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'select_uniformes_remove',
    async execute(interaction) {
        const uniformId = interaction.values[0];
        await db.query('DELETE FROM uniforms WHERE id = $1 AND guild_id = $2', [uniformId, interaction.guild.id]);
        
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateUniformesMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: '✅ Uniforme removido com sucesso!', ephemeral: true });
    }
};