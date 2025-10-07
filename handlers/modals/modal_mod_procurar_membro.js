// handlers/modals/modal_mod_procurar_membro.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
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
    customId: 'modal_mod_procurar_membro',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const hasPermission = await hasModPermission(interaction);
        if (!hasPermission) {
            return interaction.editReply({ content: '❌ Você não tem permissão para aceder aos dossiês de moderação.' });
        }

        const query = interaction.fields.getTextInputValue('input_member');
        let member;

        const userId = query.replace(/<@!?|>/g, '');

        try {
            member = await interaction.guild.members.fetch(userId);
        } catch (error) {
            return interaction.editReply({ content: '❌ Membro não encontrado. Verifique o ID, nome ou menção fornecida.' });
        }

        if (!member) {
            return interaction.editReply({ content: '❌ Membro não encontrado.' });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        
        // Passando a 'interaction' para o gerador do embed
        const dossiePayload = generateDossieEmbed(member, history, interaction);
        
        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};