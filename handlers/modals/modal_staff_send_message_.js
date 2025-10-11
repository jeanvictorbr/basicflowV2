// Crie em: handlers/modals/modal_staff_send_message_.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_staff_send_message_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const [, , , , guildId, cartId] = interaction.customId.split('_');
        const messageContent = interaction.fields.getTextInputValue('input_message_to_customer');

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        if (!cart) {
            return interaction.editReply({ content: '❌ Este carrinho não existe mais.' });
        }

        try {
            const customer = await interaction.client.users.fetch(cart.user_id);
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ name: `💬 Mensagem do Atendimento`, iconURL: interaction.guild.iconURL() })
                .setDescription(messageContent)
                .setFooter({ text: `Atendente: ${interaction.user.tag}` });
            
            await customer.send({ embeds: [embed] });
            await interaction.editReply({ content: '✅ Sua mensagem foi enviada ao cliente!' });
        } catch (error) {
            console.error('[Store DM] Falha ao enviar mensagem do staff para o cliente:', error);
            await interaction.editReply({ content: '❌ Não foi possível entregar sua mensagem. O cliente pode ter bloqueado as DMs.' });
        }
    }
};