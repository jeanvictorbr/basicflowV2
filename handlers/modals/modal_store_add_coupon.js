// Crie em: handlers/modals/modal_store_add_coupon.js
const db = require('../../database.js');
const generateCouponsMenu = require('../../ui/store/couponsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_add_coupon',
    async execute(interaction) {
        await interaction.deferUpdate();

        const code = interaction.fields.getTextInputValue('input_code').toUpperCase();
        const discount = parseInt(interaction.fields.getTextInputValue('input_discount'), 10);
        const uses = parseInt(interaction.fields.getTextInputValue('input_uses'), 10);

        if (isNaN(discount) || isNaN(uses) || discount <= 0 || discount > 100 || uses <= 0) {
            return interaction.followUp({ content: '❌ Dados inválidos. A porcentagem de desconto deve ser entre 1 e 100, e a quantidade de usos deve ser maior que 0.', ephemeral: true });
        }
        
        // Verifica se o cupom já existe
        const existingCoupon = await db.query('SELECT 1 FROM store_coupons WHERE guild_id = $1 AND code = $2', [interaction.guild.id, code]);
        if (existingCoupon.rows.length > 0) {
            return interaction.followUp({ content: `❌ O cupom com o código \`${code}\` já existe.`, ephemeral: true });
        }

        await db.query(
            'INSERT INTO store_coupons (guild_id, code, discount_percent, uses_left) VALUES ($1, $2, $3, $4)',
            [interaction.guild.id, code, discount, uses]
        );

        const coupons = (await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateCouponsMenu(coupons, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: `✅ Cupom \`${code}\` criado com sucesso!`, ephemeral: true });
    }
};