// Crie a pasta 'utils' na raiz do seu projeto
// Crie o arquivo: utils/updateUniformVitrine.js
const db = require('../database.js');
const generateUniformesVitrine = require('../ui/uniformesVitrine.js');

async function updateUniformVitrine(client, guildId) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings || !settings.uniformes_vitrine_channel_id || !settings.uniformes_vitrine_message_id) {
        return; // Nenhuma vitrine publicada para atualizar
    }

    try {
        const channel = await client.channels.fetch(settings.uniformes_vitrine_channel_id);
        const message = await channel.messages.fetch(settings.uniformes_vitrine_message_id);
        const uniforms = (await db.query('SELECT * FROM uniforms WHERE guild_id = $1 ORDER BY name ASC', [guildId])).rows;
        
        // Passamos um objeto `guild` falso para a função de UI para que ela possa pegar o ícone
        const updatedVitrine = generateUniformesVitrine({ guild: channel.guild }, settings, uniforms, uniforms[0] || null);
        
        await message.edit(updatedVitrine);
        console.log(`[LOG] Vitrine de uniformes para a guild ${guildId} foi atualizada.`);
    } catch (error) {
        console.error(`[ERRO] Falha ao atualizar a vitrine de uniformes para a guild ${guildId}:`, error);
        // Se a mensagem foi deletada, limpamos o DB para evitar futuros erros
        if (error.code === 10008) {
            await db.query('UPDATE guild_settings SET uniformes_vitrine_channel_id = NULL, uniformes_vitrine_message_id = NULL WHERE guild_id = $1', [guildId]);
        }
    }
}

module.exports = updateUniformVitrine;