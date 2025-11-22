// File: handlers/buttons/store_pay_manual.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_pay_manual',
    async execute(interaction) {
        // Cria uma nova mensagem efêmera para evitar conflito com a interface V2 anterior
        await interaction.deferReply({ ephemeral: true });

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const settings = (await db.query('SELECT store_pix_key FROM guild_settings WHERE guild_id = $1', [cart.guild_id])).rows[0];
        const pixKey = settings?.store_pix_key || "CHAVE PIX NÃO CONFIGURADA";

        // Cria um novo Embed do zero (mais seguro que .from)
        const instructionsEmbed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('📄 Pagamento Manual via PIX')
            .setDescription('**1.** Realize o pagamento para a chave PIX abaixo.\n**2.** Tire um print do comprovante.\n**3.** Clique no botão "Anexar Comprovante" e envie a imagem aqui no canal.')
            .addFields(
                { name: 'Chave PIX (Copia e Cola)', value: `\`${pixKey}\`` },
                { name: 'Status', value: 'Aguardando comprovante...' }
            );

        const userButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`store_attach_receipt`)
                .setLabel('Anexar Comprovante')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📎'),
            // Removemos o botão "Voltar" pois agora é uma nova mensagem efêmera. 
            // O usuário pode apenas fechar ("Ignorar") esta mensagem.
        );

        // Enviamos SEM a flag V2, permitindo Embeds.
        await interaction.editReply({ embeds: [instructionsEmbed], components: [userButtons] });
    }
};