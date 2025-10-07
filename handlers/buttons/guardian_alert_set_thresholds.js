// Crie em: handlers/buttons/guardian_alert_set_thresholds.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'guardian_alert_set_thresholds',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const modal = new ModalBuilder().setCustomId('modal_guardian_alert_thresholds').setTitle('Ajustar Sensibilidade dos Alertas');

        const toxicityInput = new TextInputBuilder().setCustomId('input_toxicity').setLabel("Limiar de Toxicidade (0-100)").setStyle(TextInputStyle.Short).setValue(String(settings.guardian_ai_alert_toxicity_threshold || '75')).setRequired(true);
        const sarcasmInput = new TextInputBuilder().setCustomId('input_sarcasm').setLabel("Limiar de Sarcasmo (0-100)").setStyle(TextInputStyle.Short).setValue(String(settings.guardian_ai_alert_sarcasm_threshold || '80')).setRequired(true);
        const attackInput = new TextInputBuilder().setCustomId('input_attack').setLabel("Limiar de Ataque Pessoal (0-100)").setStyle(TextInputStyle.Short).setValue(String(settings.guardian_ai_alert_attack_threshold || '80')).setRequired(true);
            
        modal.addComponents(
            new ActionRowBuilder().addComponents(toxicityInput),
            new ActionRowBuilder().addComponents(sarcasmInput),
            new ActionRowBuilder().addComponents(attackInput)
        );
        await interaction.showModal(modal);
    }
};