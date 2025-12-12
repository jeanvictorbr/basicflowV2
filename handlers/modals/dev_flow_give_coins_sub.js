const db = require('../../database.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'dev_flow_give_coins_sub',
    async execute(interaction) {
        const targetId = interaction.fields.getTextInputValue('user_id');
        const amount = parseInt(interaction.fields.getTextInputValue('amount'));

        if (isNaN(amount)) return interaction.reply({ content: "Quantidade inválida.", ephemeral: true });

        // Upsert para garantir que o usuário existe
        const res = await db.query(`
            INSERT INTO flow_users (user_id, balance) VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET balance = flow_users.balance + $2
            RETURNING balance
        `, [targetId, amount]);

        await interaction.reply({
            components: [{ type: 10, content: `✅ **Enviado!**\n👤 <@${targetId}>\n💰 +${amount} FC\n👛 Novo Saldo: \`${res.rows[0].balance} FC\``, style: 1 }],
            flags: V2_FLAG,
            ephemeral: true
        });
    }
};