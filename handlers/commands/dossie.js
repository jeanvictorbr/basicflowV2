// handlers/commands/dossie.js
const { PermissionFlagsBits } = require('discord.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    // O customId corresponde ao nome do comando de menu de contexto
    customId: 'Ver Dossiê',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        
        // CORREÇÃO: Em um comando de menu de contexto de usuário, o alvo é 'interaction.targetUser'.
        const targetUser = interaction.targetUser;

        // 'await' é necessário pois a função que gera o embed é assíncrona
        const dossie = await generateDossieEmbed(interaction, targetUser, 0);
        
        await interaction.editReply(dossie);
    }
};