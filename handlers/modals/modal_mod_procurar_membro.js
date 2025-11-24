// handlers/modals/modal_mod_procurar_membro.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const { PermissionsBitField } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

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
            return interaction.editReply({ content: '❌ Você não tem permissão para acessar os dossiês de moderação.' });
        }

        const query = interaction.fields.getTextInputValue('input_member');
        let member;

        // Limpeza robusta de input (aceita ID puro ou menção <@!123>)
        const userId = query.replace(/\D/g, ''); // Remove tudo que não é dígito

        if (!userId) {
             return interaction.editReply({ content: '❌ ID inválido fornecido.' });
        }

        try {
            // Tenta buscar o membro no cache ou API
            member = await interaction.guild.members.fetch(userId);
        } catch (error) {
            // Erro comum: Unknown Member (usuário não está no servidor)
            // Se não está no servidor, não podemos mostrar cargos atuais, mas podemos mostrar histórico antigo?
            // Por enquanto, o sistema exige objeto Member para UI. Vamos retornar erro amigável.
            return interaction.editReply({ content: '❌ Membro não encontrado no servidor. Verifique o ID.' });
        }

        if (!member) {
            return interaction.editReply({ content: '❌ Membro não encontrado.' });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        
        try {
            const dossiePayload = await generateDossieEmbed(interaction, member, history, notes);
            
            await interaction.editReply({
                components: dossiePayload.components,
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });
        } catch (uiError) {
            console.error("Erro ao gerar UI do dossiê:", uiError);
            await interaction.editReply({ content: '❌ Ocorreu um erro interno ao gerar o visual do dossiê.' });
        }
    }
};