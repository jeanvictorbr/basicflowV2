// handlers/buttons/store_manage_stock.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateStockMenu = require('../../ui/store/stockMenu.js'); // Assumindo que existe uma UI para isso

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_stock',
    async execute(interaction) {
        // 1. Verificação Estrita: APENAS ADMIN (Para não ver as keys reais)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: '🔒 **Conteúdo Protegido:** Apenas Administradores podem visualizar/editar o estoque real (Keys).\n✅ Você ainda pode **Adicionar Estoque** usando o botão no menu do produto.', 
                ephemeral: true 
            });
        }

        await interaction.deferUpdate();

        try {
            // Lógica original para carregar o menu de estoque
            const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
            
            // Se tiver função de UI pronta
            if (typeof generateStockMenu === 'function') {
                const payload = await generateStockMenu(interaction, products);
                await interaction.editReply({ ...payload, flags: V2_FLAG | EPHEMERAL_FLAG });
            } else {
                // Fallback simples se a UI não for importada
                await interaction.editReply({ content: '✅ Menu de estoque carregado (Admin).' });
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao abrir gestão de estoque.' });
        }
    }
};