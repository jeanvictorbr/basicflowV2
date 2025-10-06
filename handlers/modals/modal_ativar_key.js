// Crie em: handlers/modals/modal_ativar_key.js
const db = require('../../database.js');

module.exports = {
    customId: 'modal_ativar_key',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const key = interaction.fields.getTextInputValue('input_key');

        const keyData = (await db.query('SELECT * FROM activation_keys WHERE key = $1', [key])).rows[0];

        if (!keyData || keyData.uses_left <= 0) {
            return interaction.editReply({ content: '❌ Chave de ativação inválida, expirada ou já utilizada.' });
        }

        const durationDays = keyData.duration_days;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + durationDays);

        // Atualiza as configurações da guild
        await db.query(
            `UPDATE guild_settings SET premium_status = true, premium_expires_at = $1 WHERE guild_id = $2`,
            [expirationDate, interaction.guild.id]
        );

        // Decrementa o uso da chave
        await db.query('UPDATE activation_keys SET uses_left = uses_left - 1 WHERE key = $1', [key]);

        await interaction.editReply({
            content: `✅ Licença Premium ativada com sucesso! Seu acesso às funcionalidades premium é válido até **${expirationDate.toLocaleDateString('pt-BR')}**.`
        });
    }
};