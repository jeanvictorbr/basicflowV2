const db = require('../../database.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'dev_flow_remove_select',
    async execute(interaction) {
        const itemId = interaction.values[0];

        // Deletamos fisicamente ou apenas desativamos. Deletar é mais limpo para dev.
        await db.query('DELETE FROM flow_shop_items WHERE id = $1', [itemId]);

        await interaction.update({
            content: `✅ **Produto removido com sucesso!**`,
            components: [],
            flags: V2_FLAG // Mantemos compatibilidade se quiser usar UI V2 no futuro aqui
        });
    }
};