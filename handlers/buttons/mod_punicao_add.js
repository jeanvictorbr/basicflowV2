// Crie em: handlers/buttons/mod_punicao_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_punicao_add',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mod_punicao_add')
            .setTitle('Criar Nova Punição Personalizada');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_name').setLabel("Nome da Punição (Ex: Aviso Verbal)").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_action').setLabel("Ação (WARN, TIMEOUT, KICK, BAN)").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_duration').setLabel("Duração (Opcional, ex: 10m, 1h, 7d)").setStyle(TextInputStyle.Short).setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_role_id').setLabel("ID do Cargo a ser Associado (Opcional)").setStyle(TextInputStyle.Short).setRequired(false))
        );
        
        await interaction.showModal(modal);
    }
};