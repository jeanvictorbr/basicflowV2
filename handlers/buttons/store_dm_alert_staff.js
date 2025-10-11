// Crie em: handlers/buttons/store_dm_alert_staff.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'store_dm_alert_staff_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const [,,, guildId, cartId] = interaction.customId.split('_');

        const settings = (await db.query('SELECT store_log_channel_id, store_staff_role_id FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const cart = (await db.query('SELECT thread_id FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];

        if (!settings.store_log_channel_id || !settings.store_staff_role_id) {
            return interaction.editReply({ content: '❌ O sistema de logs da loja não está configurado corretamente.' });
        }
        if (!cart || !cart.thread_id) {
            return interaction.editReply({ content: '❌ Não foi possível encontrar a thread de atendimento associada a este carrinho.' });
        }

        try {
            const logChannel = await interaction.client.channels.fetch(settings.store_log_channel_id);
            const alertEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('🔔 Alerta de Atendimento')
                .setDescription(`O cliente ${interaction.user} solicitou atenção no seu carrinho de compras!\n\n**Clique aqui para ir ao atendimento:** <#${cart.thread_id}>`);

            await logChannel.send({
                content: `<@&${settings.store_staff_role_id}>`,
                embeds: [alertEmbed]
            });

            await interaction.editReply({ content: '✅ A equipe de atendimento foi notificada!' });
        } catch (error) {
            console.error('[Store Alert] Erro ao notificar staff:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar notificar a equipe.' });
        }
    }
};