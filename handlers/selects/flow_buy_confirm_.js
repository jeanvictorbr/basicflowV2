const db = require('../../database.js');

module.exports = {
    customId: 'flow_buy_confirm_',
    async execute(interaction) {
        const itemId = interaction.customId.split('flow_buy_confirm_')[1];
        const targetGuildId = interaction.values[0];

        // 1. Verificação de Segurança (Saldo e Item)
        // Usamos uma transação implícita para garantir a consistência
        const check = await db.query(`
            SELECT u.balance, i.price, i.feature_key, i.duration_days, i.name
            FROM flow_users u, flow_shop_items i
            WHERE u.user_id = $1 AND i.id = $2
        `, [interaction.user.id, itemId]);

        if (check.rows.length === 0) {
            return interaction.update({ content: "❌ Erro: Usuário ou Item não encontrado.", components: [] });
        }

        const data = check.rows[0];
        if (data.balance < data.price) {
            return interaction.update({ content: `💸 **Saldo Insuficiente!**\nVocê tem: \`${data.balance} FC\`\nPreço: \`${data.price} FC\``, components: [] });
        }

        // 2. Descontar Saldo
        await db.query('UPDATE flow_users SET balance = balance - $1 WHERE user_id = $2', [data.price, interaction.user.id]);

        // 3. LIBERAR O ACESSO NA GUILDA (Crucial)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + data.duration_days);

        await db.query(`
            INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key)
            VALUES ($1, $2, $3, 'FLOWCOINS_SHOP')
            ON CONFLICT (guild_id, feature_key) 
            DO UPDATE SET expires_at = $3 -- Estende a data se já existir
        `, [targetGuildId, data.feature_key, expiresAt]);

        // 4. Log/Feedback
        await interaction.update({ 
            content: `✅ **Compra Confirmada!**\n\n📦 **Produto:** ${data.name}\n🏢 **Servidor:** ${targetGuildId}\n🔑 **Feature Liberada:** \`${data.feature_key}\`\n⏳ **Validade:** ${data.duration_days} dias\n\n*A funcionalidade já está ativa no servidor.*`, 
            components: [] 
        });
    }
};