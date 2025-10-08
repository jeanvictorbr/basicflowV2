// handlers/commands/dossie.js
const { PermissionFlagsBits } = require('discord.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    customId: 'Ver Dossiê',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        
        // Pega o objeto de usuário completo da interação de menu de contexto
        const targetUser = interaction.targetUser;

        // CORREÇÃO: 'await' é necessário pois a função agora é sempre assíncrona
        const dossie = await generateDossieEmbed(interaction, targetUser, 0);
        
        await interaction.editReply(dossie);
    }
};