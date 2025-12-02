// handlers/commands/configurar.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const mainMenu = require('../../ui/mainMenu.js'); 
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js'); 

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
    // 1. Adia a resposta
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    try {
        // [FIX] Força a atualização do membro para garantir que os cargos estejam atualizados
        const member = await interaction.guild.members.fetch(interaction.user.id);

        // 2. Busca configurações do banco
        let settings = {};
        const res = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        if (res.rows.length > 0) {
            settings = res.rows[0];
        } else {
            // Cria config padrão se não existir
            await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING', [interaction.guild.id]);
            settings = { guild_id: interaction.guild.id };
        }

        // 3. Verificação de Permissões (DEBUG)
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        const staffRoleId = settings.store_staff_role_id;
        const hasStaffRole = staffRoleId && member.roles.cache.has(staffRoleId);

        // SE FOR BLOQUEADO: Mostra exatamente o motivo
        if (!isAdmin && !hasStaffRole) {
            let debugMsg = '❌ **Acesso Negado**\n\n';
            debugMsg += `🔒 **É Admin?** ${isAdmin ? '✅ Sim' : '❌ Não'}\n`;
            debugMsg += `👮 **Cargo Staff Configurado:** ${staffRoleId ? `<@&${staffRoleId}> (\`${staffRoleId}\`)` : '⚠️ Não configurado no Painel'}\n`;
            debugMsg += `👤 **Você tem o cargo?** ${hasStaffRole ? '✅ Sim' : '❌ Não'}\n\n`;
            debugMsg += `💡 *Solução: Peça para um Admin ir em "Loja > Configurações > Definir Cargo Staff" e selecionar o cargo correto.*`;

            return interaction.editReply({ content: debugMsg });
        }

        // 4. Se passou, mostra o menu
        const menuComponents = await mainMenu(interaction, 0, settings); 

        await interaction.editReply({
            components: menuComponents, // Passando corretamente como components
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

    } catch (error) {
        console.error('Erro ao executar /configurar:', error);
        await interaction.editReply({
            content: `❌ **Erro Crítico:** \`${error.message}\``
        });
    }
}

module.exports = {
    execute,
};