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
        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        
        // Determina a primeira categoria a ser exibida, ou 'null' se não houver.
        const initialCategoryId = settings.store_categories_enabled && categories.length > 0 ? categories[0].id.toString() : null;

        try {
            const vitrinePayload = generateVitrineMenu(settings, categories, products, initialCategoryId, 0);
            const sentMessage = await channel.send(vitrinePayload);

            await db.query(
                'UPDATE guild_settings SET store_vitrine_message_id = $1 WHERE guild_id = $2',
                [sentMessage.id, interaction.guild.id]
            );

            await interaction.editReply(`✅ Vitrine publicada com sucesso em ${channel}!`);
        } catch (error) {
            console.error('[Store] Erro ao publicar vitrine:', error);
            await interaction.editReply('❌ Ocorreu um erro. Verifique se eu tenho permissão para enviar mensagens no canal da vitrine.');
        }
    }
};