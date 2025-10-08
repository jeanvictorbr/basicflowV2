// Substitua o conteúdo em: handlers/commands/dossie.js
const { PermissionFlagsBits } = require('discord.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'Ver Dossiê',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        
        const targetUser = interaction.targetUser;

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetUser.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetUser.id, interaction.guild.id])).rows;

        const dossiePayload = await generateDossieEmbed(interaction, targetUser, history, notes, 0);
        
        await interaction.editReply({
            ...dossiePayload,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};