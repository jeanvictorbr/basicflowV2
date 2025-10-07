// Substitua em: handlers/buttons/guardian_step_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js'); // Importar DB

module.exports = {
    customId: 'guardian_step_add_', // Handler dinâmico
    async execute(interaction) {
        const policyId = interaction.customId.split('_')[3];
        const settings = (await db.query('SELECT guardian_use_mod_punishments FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_step_create_${policyId}`)
            .setTitle('Adicionar Novo Passo de Ação');

        let actionsPlaceholder = 'AVISAR_CHAT, DELETAR, TIMEOUT, KICK, BAN';
        if (settings.guardian_use_mod_punishments) {
            actionsPlaceholder = 'Use o ID de uma Punição Personalizada (Ex: 3)';
        }

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_threshold')
                    .setLabel("Limiar do Gatilho (Nº de msgs, %, etc)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 3 (para 3 mensagens de spam)')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_actions')
                    .setLabel("Ação a ser Executada")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(actionsPlaceholder) // Placeholder dinâmico
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_timeout')
                    .setLabel("Duração do Timeout (se usar ação simples)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 5 (não preencha se usar ID de Punição)')
                    .setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};