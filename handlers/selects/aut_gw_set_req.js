// handlers/selects/aut_gw_set_req.js
const db = require('../../database');
const { getGiveawayComponents } = require('../../utils/giveawayManager');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_set_req_',
    async execute(interaction) {
        const messageId = interaction.customId.split('_').pop();
        const roles = interaction.values; // Array de IDs

        await db.query("UPDATE automations_giveaways SET required_roles = $1 WHERE message_id = $2", [roles, messageId]);

        // Atualiza a mensagem pública para mostrar os requisitos
        const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
        if (gw) {
            try {
                const channel = await interaction.guild.channels.fetch(gw.channel_id);
                const msg = await channel.messages.fetch(messageId);
                const payload = await getGiveawayComponents(gw, interaction.client);
                await msg.edit(payload);
            } catch (e) {}
        }

        await interaction.reply({ content: "✅ Cargos obrigatórios definidos com sucesso!", flags: EPHEMERAL_FLAG });
    }
};