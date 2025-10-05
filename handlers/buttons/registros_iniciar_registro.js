// handlers/buttons/registros_iniciar_registro.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'registros_iniciar_registro',
    async execute(interaction) {
        // Verifica se o usuário já tem uma ficha pendente para evitar spam
        const existing = await db.query('SELECT * FROM pending_registrations WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id]);
        if (existing.rows.length > 0) {
            return interaction.reply({ content: 'Você já possui uma ficha de registro em análise. Por favor, aguarde a resposta de um administrador.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_registro_submit')
            .setTitle('Formulário de Registro');

        const nomeRpInput = new TextInputBuilder()
            .setCustomId('input_nome_rp')
            .setLabel("Seu Nome no RP")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: John Doe')
            .setRequired(true);

        const idRpInput = new TextInputBuilder()
            .setCustomId('input_id_rp')
            .setLabel("Seu ID no servidor RP")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 123')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nomeRpInput),
            new ActionRowBuilder().addComponents(idRpInput)
        );

        await interaction.showModal(modal);
    }
};