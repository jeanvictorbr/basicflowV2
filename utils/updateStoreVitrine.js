// Substitua o conteúdo em: utils/updateStoreVitrine.js
const db = require('../database.js');
const generateVitrineMenu = require('../ui/store/vitrineMenu.js');

async function updateStoreVitrine(client, guildId) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    
    // Verifica se a vitrine foi configurada corretamente
    if (!settings || !settings.store_vitrine_channel_id || !settings.store_vitrine_message_id) {
        return; // Nenhuma vitrine publicada para atualizar
    }

    try {
        const channel = await client.channels.fetch(settings.store_vitrine_channel_id);
        const message = await channel.messages.fetch(settings.store_vitrine_message_id);
        
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 AND is_enabled = true ORDER BY name ASC', [guildId])).rows;
        
        const updatedVitrine = generateVitrineMenu(settings, products);
        
        await message.edit(updatedVitrine);
        console.log(`[LOG] Vitrine da loja para a guild ${guildId} foi atualizada.`);
    } catch (error) {
        console.error(`[ERRO] Falha ao atualizar a vitrine da loja para a guild ${guildId}:`, error);
        // Se a mensagem foi deletada, limpa os dados do DB para evitar futuros erros
        if (error.code === 10008) { // Unknown Message
            await db.query('UPDATE guild_settings SET store_vitrine_channel_id = NULL, store_vitrine_message_id = NULL WHERE guild_id = $1', [guildId]);
        }
    }
}

module.exports = updateStoreVitrine;