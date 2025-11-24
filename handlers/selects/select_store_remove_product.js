// Substitua em: handlers/selects/select_store_remove_product.js
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_product',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const productId = interaction.values[0];
        if (productId === 'no_result') return;

        try {
            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];

            if (!product) {
                return interaction.editReply({ content: '❌ Produto já não existe mais.', components: [] });
            }

            // Construção Manual da UI de Confirmação
            const confirmPanel = [
                {
                    type: 17,
                    components: [
                        { type: 10, content: `> **🗑️ Excluir Produto:** ${product.name}` },
                        { type: 10, content: `> **ATENÇÃO:** Você tem certeza? Essa ação não pode ser desfeita.\n> **ID:** ${product.id}` },
                        { type: 14, divider: true, spacing: 2 },
                        {
                            type: 1,
                            components: [
                                // Botão CONFIRMAR (Vermelho)
                                { 
                                    type: 2, 
                                    style: 4, // Danger
                                    label: "SIM, EXCLUIR", 
                                    emoji: { name: "🗑️" }, 
                                    custom_id: `store_confirm_delete_${product.id}` 
                                },
                                // Botão CANCELAR (Cinza) - Volta pro menu anterior
                                { 
                                    type: 2, 
                                    style: 2, 
                                    label: "Cancelar", 
                                    emoji: { name: "↩️" }, 
                                    custom_id: "store_remove_product" 
                                }
                            ]
                        }
                    ]
                }
            ];

            await interaction.editReply({
                components: confirmPanel,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao abrir confirmação de delete:", error);
        }
    }
};