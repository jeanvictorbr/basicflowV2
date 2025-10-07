// Crie em: handlers/buttons/mod_punicao_add_no_role.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'mod_punicao_add_no_role',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mod_punicao_add_manual') // Reutiliza o handler manual, que já aceita role_id nulo
            .setTitle('Nova Punição (Sem Cargo)');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_name').setLabel("Nome da Punição (Ex: Aviso Chat)").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_action').setLabel("Ação (WARN, TIMEOUT, KICK, BAN)").setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_duration').setLabel("Duração (Opcional, ex: 10m, 1h, 7d)").setStyle(TextInputStyle.Short).setRequired(false))
        );
        
        await interaction.showModal(modal);
    }
};