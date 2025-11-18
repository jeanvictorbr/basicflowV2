// File: utils/updateCloudflowShowcase.js
const db = require('../database.js');
const { getCloudflowVerifyShowcaseEmbed } = require('../ui/automations/cloudflowVerifyShowcaseEmbed.js');

/**
 * Atualiza a mensagem da vitrine de verificação publicada (se existir).
 * @param {Client} client O objeto do client.
 * @param {string} guildId O ID da guilda.
 */
async function updateCloudflowShowcase(client, guildId) {
    try {
        const settings = await db.getGuildSettings(guildId);
        
        const channelId = settings?.cloudflow_verify_channel_id;
        const messageId = settings?.cloudflow_verify_message_id;
        
        if (!channelId || !messageId) {
            // Nenhuma mensagem publicada, não faz nada
            return;
        }

        const channel = await client.channels.cache.get(channelId);
        if (!channel) {
            console.warn(`[CloudFlow Showcase] Canal ${channelId} não encontrado para atualização.`);
            return;
        }

        const message = await channel.messages.fetch(messageId);
        if (!message) {
            console.warn(`[CloudFlow Showcase] Mensagem ${messageId} não encontrada para atualização.`);
            return;
        }

        // Pega a config salva (ou um objeto vazio)
        const config = settings.cloudflow_verify_config || {};
        
        // Gera a nova UI V2 com os dados atualizados
        const newShowcaseMessage = getCloudflowVerifyShowcaseEmbed(config);

        // Edita a mensagem pública
        await message.edit(newShowcaseMessage);
        
        console.log(`[CloudFlow Showcase] Vitrine atualizada no canal ${channelId}`);

    } catch (error) {
        console.error(`[CloudFlow Showcase] Falha ao atualizar vitrine para Guild ${guildId}:`, error);
        // Não trava o bot, apenas loga o erro
    }
}

module.exports = { updateCloudflowShowcase };