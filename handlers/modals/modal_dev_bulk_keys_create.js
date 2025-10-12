// Crie em: handlers/modals/modal_dev_bulk_keys_create.js
const db = require('../../database.js');
const crypto = require('crypto');

module.exports = {
    customId: 'modal_dev_bulk_keys_create_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const encodedFeatures = interaction.customId.split('_')[5];
        const features = Buffer.from(encodedFeatures, 'base64').toString('utf8');

        const quantity = parseInt(interaction.fields.getTextInputValue('input_quantity'), 10);
        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'), 10);
        const uses = parseInt(interaction.fields.getTextInputValue('input_uses'), 10);
        const comment = interaction.fields.getTextInputValue('input_comment');

        if (isNaN(quantity) || isNaN(duration) || isNaN(uses) || quantity <= 0 || duration <= 0 || uses <= 0) {
            return interaction.editReply({ content: '❌ Quantidade, Duração e Usos devem ser números maiores que zero.' });
        }
        if (quantity > 100) {
            return interaction.editReply({ content: '❌ Você pode gerar no máximo 100 chaves por vez.' });
        }

        const generatedKeys = [];
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            for (let i = 0; i < quantity; i++) {
                const key = `BF-${crypto.randomUUID().toUpperCase()}`;
                generatedKeys.push(key);
                await client.query(
                    `INSERT INTO activation_keys (key, duration_days, uses_left, grants_features, comment)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [key, duration, uses, features, comment]
                );
            }
            
            await client.query('COMMIT');

            const keysString = generatedKeys.join('\n');
            await interaction.editReply({
                content: `✅ **${quantity} chaves geradas com sucesso!**\n\nProntas para adicionar ao seu estoque:\n\`\`\`\n${keysString}\n\`\`\``
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[DEV BULK KEYS] Erro ao gerar chaves:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar gerar as chaves no banco de dados.' });
        } finally {
            client.release();
        }
    }
};