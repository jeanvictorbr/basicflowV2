// handlers/buttons/aut_cf_backup_create.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_cf_backup_create',
    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId('aut_cf_backup_create_modal')
            .setTitle('Criar Novo Backup de Estrutura');

        const backupNameInput = new TextInputBuilder()
            .setCustomId('backup_name')
            .setLabel('Nome do Backup')
            .setPlaceholder('Ex: Backup Mensal (Dezembro)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        const passwordInput = new TextInputBuilder()
            .setCustomId('backup_password')
            .setLabel('Senha de Segurança')
            .setPlaceholder('Esta senha será EXIGIDA para restaurar. Anote-a!')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(50);

        const firstRow = new ActionRowBuilder().addComponents(backupNameInput);
        const secondRow = new ActionRowBuilder().addComponents(passwordInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    },
};