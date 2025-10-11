// Crie em: handlers/buttons/store_manage_coupons.js
const db = require('../../database.js');
const generateCouponsMenu = require('../../ui/store/couponsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_coupons',
    async execute(interaction) {
        await interaction.deferUpdate();
        const coupons = (await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateCouponsMenu(coupons, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};