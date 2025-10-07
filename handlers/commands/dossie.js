// Substitua em: handlers/commands/dossie.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const { PermissionsBitField } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Função auxiliar para verificar se o autor tem permissão
async function hasModPermission(interaction) {
    const settings = (await db.query('SELECT mod_roles FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    const modRoles = settings?.mod_roles?.split(',') || [];
    
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return true;
    }
    return interaction.member.roles.cache.some(role => modRoles.includes(role.id));
}

module.exports = {
    customId: 'Ver Dossiê',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const hasPermission = await hasModPermission(interaction);
        if (!hasPermission) {
            return interaction.editReply({ content: '❌ Você não tem permissão para aceder aos dossiês de moderação.' });
        }

        const member = interaction.targetMember;

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        
        const dossiePayload = generateDossieEmbed(member, history, notes, interaction);
        
        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};