// handlers/buttons/guardian_config_sensitivity.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'guardian_config_sensitivity',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const modal = new ModalBuilder()
            .setCustomId('modal_guardian_sensitivity')
            .setTitle('Configuração de Sensibilidade da IA');

        const toxicityInput = new TextInputBuilder()
            .setCustomId('input_toxicity')
            .setLabel("Sensibilidade à Toxicidade (0-100)")
            .setStyle(TextInputStyle.Short)
            .setValue(String(settings.guardian_ai_custom_toxicity || '80'))
            .setRequired(true);

        const sarcasmInput = new TextInputBuilder()
            .setCustomId('input_sarcasm')
            .setLabel("Sensibilidade a Sarcasmo/Provocação (0-100)")
            .setStyle(TextInputStyle.Short)
            .setValue(String(settings.guardian_ai_custom_sarcasm || '70'))
            .setRequired(true);
            
        const attackInput = new TextInputBuilder()
            .setCustomId('input_attack')
            .setLabel("Sensibilidade a Ataques Pessoais (0-100)")
            .setStyle(TextInputStyle.Short)
            .setValue(String(settings.guardian_ai_custom_attack || '90'))
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(toxicityInput),
            new ActionRowBuilder().addComponents(sarcasmInput),
            new ActionRowBuilder().addComponents(attackInput)
        );
        
        await interaction.showModal(modal);
    }
};