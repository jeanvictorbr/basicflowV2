// Crie em: handlers/modals/modal_dm_send_message_.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_dm_send_message_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        // CORREÇÃO: Extrai o cartId corretamente do customId
        const [, , , , guildId, cartId] = interaction.customId.split('_');
        const messageContent = interaction.fields.getTextInputValue('input_message_to_staff');

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        if (!cart || !cart.claimed_by_staff_id) {
            return interaction.editReply({ content: '❌ Não há um atendente conectado a este carrinho no momento.' });
        }

        try {
            const staffMember = await interaction.client.users.fetch(cart.claimed_by_staff_id);
            const embed = new EmbedBuilder()
                .setColor('Greyple')
                .setAuthor({ name: `💬 Mensagem de ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(messageContent)
                .setFooter({ text: `Carrinho #${cartId}` });
            
            await staffMember.send({ embeds: [embed] });
            await interaction.editReply({ content: '✅ Sua mensagem foi enviada ao atendente!' });
        } catch (error) {
            console.error('[Store DM] Falha ao enviar mensagem do cliente para o staff:', error);
            await interaction.editReply({ content: '❌ Não foi possível entregar sua mensagem ao atendente no momento.' });
        }
    }
};