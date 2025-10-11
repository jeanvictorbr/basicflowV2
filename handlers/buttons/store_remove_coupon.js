// Crie em: handlers/buttons/store_remove_coupon.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_remove_coupon',
    async execute(interaction) {
        await interaction.deferUpdate();
        const coupons = (await db.query('SELECT id, code FROM store_coupons WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        if (coupons.length === 0) {
            return interaction.followUp({ content: 'Não há cupons para remover.', ephemeral: true });
        }

        const options = coupons.map(c => ({
            label: c.code,
            description: `ID do Cupom: ${c.id}`,
            value: c.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_store_remove_coupon')
            .setPlaceholder('Selecione o cupom que deseja REMOVER')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('store_manage_coupons').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.editReply({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};