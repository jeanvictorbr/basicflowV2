// handlers/buttons/aut_cf_backup_restore.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_cf_backup_restore',
    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId('aut_cf_backup_restore_modal')
            .setTitle('Restaurar Backup de Estrutura');

        const backupIdInput = new TextInputBuilder()
            .setCustomId('backup_id')
            .setLabel('ID do Backup')
            .setPlaceholder('Insira o ID do backup que você recebeu na DM')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId('backup_password')
            .setLabel('Senha de Segurança')
            .setPlaceholder('A senha que você definiu ao criar o backup')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(backupIdInput);
        const secondRow = new ActionRowBuilder().addComponents(passwordInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    },
};