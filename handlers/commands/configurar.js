// handlers/commands/configurar.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const mainMenu = require('../../ui/mainMenu.js'); 
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js'); 

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
    // 1. Adia a resposta para evitar timeout
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    // --- CORREÇÃO DO ERRO CRÍTICO ---
    // Verifica se o comando está sendo usado dentro de um servidor.
    // Se interaction.guild for null (ex: em DM), retorna aviso e para a execução.
    if (!interaction.guild) {
        return interaction.editReply({ 
            content: '❌ **Ação Inválida:** O painel de configuração (`/configurar`) só pode ser acessado dentro de um servidor.' 
        });
    }
    // -------------------------------

    try {
        // [FIX] Força a atualização do membro para garantir que os cargos estejam atualizados (Cache Busting)
        // Agora é seguro usar interaction.guild pois passamos pela verificação acima.
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

        // 3. Verificação de Permissões (Híbrida: Admin OU Staff da Loja)
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        const staffRoleId = settings.store_staff_role_id;
        const hasStaffRole = staffRoleId && member.roles.cache.has(staffRoleId);

        // Se NÃO for Admin E NÃO for Staff, bloqueia
        if (!isAdmin && !hasStaffRole) {
            let debugMsg = '❌ **Acesso Negado**\n\n';
            debugMsg += `Você precisa de permissão de **Administrador** ou ter o cargo de **Staff da Loja** para acessar este painel.\n`;
            
            // Informação de Debug para ajudar a entender o erro
            if (staffRoleId && !hasStaffRole) {
                debugMsg += `\n🔍 **Diagnóstico:** O cargo Staff configurado é <@&${staffRoleId}>, mas você não o possui.`;
            } else if (!staffRoleId && !isAdmin) {
                debugMsg += `\n⚠️ **Aviso:** Nenhum cargo de Staff foi configurado ainda neste servidor.`;
            }

            return interaction.editReply({ content: debugMsg });
        }

        // 4. Se passou, gera e envia o menu
        const menuComponents = await mainMenu(interaction, 0, settings); 

        await interaction.editReply({
            components: menuComponents, // Array de componentes V2
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

    } catch (error) {
        console.error('Erro ao executar /configurar:', error);
        await interaction.editReply({
            content: `❌ **Erro Crítico ao carregar painel:** \`${error.message}\``
        });
    }
}

module.exports = {
    execute,
};