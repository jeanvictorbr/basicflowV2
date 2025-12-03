// handlers/buttons/store_add_stock.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_add_stock', // O ID base é store_add_stock (o _ID vem depois)
    async execute(interaction) {
        // 1. Verificação de Permissão (Admin OU Staff da Loja)
        const settings = (await db.query('SELECT store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const isStoreStaff = settings.store_staff_role_id && interaction.member.roles.cache.has(settings.store_staff_role_id);

        if (!isAdmin && !isStoreStaff) {
            return interaction.reply({ content: '❌ Sem permissão para adicionar estoque.', ephemeral: true });
        }

        // Recupera o ID do produto
        // O formato esperado é store_add_stock_PRODUTOID
        const parts = interaction.customId.split('_');
        const productId = parts.length > 3 ? parts[3] : null;

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_add_stock_${productId || ''}`)
            .setTitle('Adicionar Estoque/Keys');

        // --- CORREÇÃO AQUI: O ID deve ser 'input_stock_content' para bater com o modal ---
        const stockInput = new TextInputBuilder()
            .setCustomId('input_stock_content') 
            .setLabel("Conteúdo do Estoque (um item por linha)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('KEY-12345\nKEY-67890\nLINK-DOWNLOAD')
            .setRequired(true);
        // ---------------------------------------------------------------------------------

        modal.addComponents(new ActionRowBuilder().addComponents(stockInput));
        await interaction.showModal(modal);
    }
};