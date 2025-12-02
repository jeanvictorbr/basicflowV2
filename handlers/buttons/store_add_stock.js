// handlers/buttons/store_add_stock.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_add_stock',
    async execute(interaction) {
        // 1. Busca permissões
        const settings = (await db.query('SELECT store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const isStoreStaff = settings.store_staff_role_id && interaction.member.roles.cache.has(settings.store_staff_role_id);

        // Permite Admin OU Staff
        if (!isAdmin && !isStoreStaff) {
            return interaction.reply({ content: '❌ Sem permissão para adicionar estoque.', ephemeral: true });
        }

        // Obtém o ID do produto do customId (se houver, ex: store_add_stock_123)
        // Se for botão genérico, o modal pede o ID/Nome depois
        const parts = interaction.customId.split('_');
        const productId = parts.length > 3 ? parts[3] : null;

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_add_stock_${productId || ''}`) // Passa o ID adiante se existir
            .setTitle('Adicionar Estoque/Keys');

        // Se não tiver ID no botão, talvez precise selecionar (mas geralmente esse botão fica no produto)
        // Vou assumir a estrutura padrão de adicionar conteúdo
        
        const contentInput = new TextInputBuilder()
            .setCustomId('input_content')
            .setLabel("Conteúdo (Keys/Links)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Uma key por linha ou texto do produto...")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(contentInput));
        
        await interaction.showModal(modal);
    }
};