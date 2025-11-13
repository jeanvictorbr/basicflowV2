// handlers/modals/aut_gw_edit_sub.js
const db = require('../../database');
const { getGiveawayComponents } = require('../../utils/giveawayManager');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_edit_sub_',
    async execute(interaction) {
        const messageId = interaction.customId.split('_').pop();
        const prize = interaction.fields.getTextInputValue('prize');
        const desc = interaction.fields.getTextInputValue('desc');
        const winners = parseInt(interaction.fields.getTextInputValue('winners')) || 1;

        // Atualiza DB
        await db.query(
            "UPDATE automations_giveaways SET prize = $1, description = $2, winner_count = $3 WHERE message_id = $4",
            [prize, desc, winners, messageId]
        );

        // Atualiza Mensagem Pública
        const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
        if (gw) {
            try {
                const channel = await interaction.guild.channels.fetch(gw.channel_id);
                const msg = await channel.messages.fetch(messageId);
                const payload = await getGiveawayComponents(gw, interaction.client);
                await msg.edit(payload);
            } catch (e) {
                console.error("Erro ao atualizar mensagem editada:", e);
            }
        }

        await interaction.reply({ content: "✅ Informações atualizadas com sucesso!", flags: EPHEMERAL_FLAG });
    }
};