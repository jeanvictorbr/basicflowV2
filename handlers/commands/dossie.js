// handlers/commands/dossie.js
const { PermissionFlagsBits } = require('discord.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');

module.exports = {
    customId: 'dossie',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser('user');
        
        // CORREÇÃO: Usando 'await' pois a função agora é assíncrona
        const dossie = await generateDossieEmbed(interaction, targetUser, 0);
        
        await interaction.editReply(dossie);
    }
};