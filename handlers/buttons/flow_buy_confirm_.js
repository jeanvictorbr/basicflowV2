// Crie/Edite: handlers/buttons/flow_buy_confirm_.js
const db = require('../../database.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    customId: 'flow_buy_confirm_',
    async execute(interaction) {
        const productId = interaction.customId.split('_')[3];
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Re-verifica saldo e produto (segurança contra double-click)
            const product = (await client.query('SELECT * FROM flow_shop_items WHERE id = $1', [productId])).rows[0];
            const user = (await client.query('SELECT balance FROM flow_users WHERE user_id = $1 FOR UPDATE', [userId])).rows[0];

            if (!product) throw new Error('Produto inválido.');
            if (user.balance < product.price) throw new Error('Saldo insuficiente.');

            // 2. Desconta Saldo
            await client.query('UPDATE flow_users SET balance = balance - $1 WHERE user_id = $2', [product.price, userId]);

            // 3. Ativa a Feature no Servidor
            const durationMs = product.duration_days * 24 * 60 * 60 * 1000;
            const expiryDate = new Date(Date.now() + durationMs);

            // Verifica se já tem a feature para estender ou criar
            await client.query(`
                INSERT INTO guild_features (guild_id, feature_key, expires_at, activated_by_key)
                VALUES ($1, $2, $3, 'FLOW_SHOP')
                ON CONFLICT (guild_id, feature_key) 
                DO UPDATE SET expires_at = CASE 
                    WHEN guild_features.expires_at > NOW() THEN guild_features.expires_at + ($4 || ' milliseconds')::INTERVAL
                    ELSE $3
                END
            `, [guildId, product.feature_key, expiryDate, durationMs]);

            await client.query('COMMIT');

            await interaction.editReply(`✅ **Compra realizada com sucesso!**\nO item **${product.name}** foi ativado neste servidor.`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            await interaction.editReply(`❌ Erro na compra: ${error.message}`);
        } finally {
            client.release();
        }
    }
};