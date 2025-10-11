// Substitua o conteúdo em: handlers/buttons/store_publish_vitrine.js
const db = require('../../database.js');
const generateVitrineMenu = require('../../ui/store/vitrineMenu.js');

module.exports = {
    customId: 'store_publish_vitrine',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const channel = await interaction.guild.channels.fetch(settings.store_vitrine_channel_id).catch(() => null);

        if (!channel) {
            return interaction.editReply('❌ O canal da vitrine não foi encontrado. Verifique as configurações.');
        }

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 AND is_enabled = true ORDER BY name ASC', [interaction.guild.id])).rows;

        try {
            const vitrinePayload = generateVitrineMenu(settings, products);
            const sentMessage = await channel.send(vitrinePayload); // Captura a mensagem enviada

            // Salva o ID da mensagem no banco de dados para futuras atualizações
            await db.query(
                'UPDATE guild_settings SET store_vitrine_message_id = $1 WHERE guild_id = $2',
                [sentMessage.id, interaction.guild.id]
            );

            await interaction.editReply(`✅ Vitrine publicada com sucesso em ${channel}! Ela será atualizada automaticamente a partir de agora.`);
        } catch (error) {
            console.error('[Store] Erro ao publicar vitrine:', error);
            await interaction.editReply('❌ Ocorreu um erro. Verifique se eu tenho permissão para enviar mensagens no canal da vitrine.');
        }
    }
};