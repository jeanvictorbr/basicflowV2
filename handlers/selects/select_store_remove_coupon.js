// Crie em: handlers/selects/select_store_remove_coupon.js
const db = require('../../database.js');
const generateCouponsMenu = require('../../ui/store/couponsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_coupon',
    async execute(interaction) {
        await interaction.deferUpdate();
        const couponId = interaction.values[0];

        // Busca o código do cupom antes de deletar para a mensagem de confirmação
        const coupon = (await db.query('SELECT code FROM store_coupons WHERE id = $1', [couponId])).rows[0];

        await db.query('DELETE FROM store_coupons WHERE id = $1 AND guild_id = $2', [couponId, interaction.guild.id]);

        const coupons = (await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateCouponsMenu(coupons, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: `✅ Cupom \`${coupon.code}\` removido com sucesso!`, ephemeral: true });
    }
};