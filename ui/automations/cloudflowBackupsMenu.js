// ui/automations/cloudflowBackupsMenu.js
const db = require('../../database');
const hasFeature = require('../../utils/featureCheck.js');

/**
 * Constrói o DASHBOARD de Backups do CloudFlow (Padrão V2 Type 17)
 * @param {Interaction} interaction - A interação original.
 * @returns {Promise<Array<object>>} - A estrutura V2 da mensagem.
 */
async function buildCloudFlowBackupsMenu(interaction) {

    const hasCloudFlow = await hasFeature(interaction.guild.id, 'AUTOMATIONS');
    const guild = interaction.guild;

    let backups = [];
    try {
        const { rows } = await db.query(
            'SELECT backup_id, backup_name, created_at, user_id FROM cloudflow_backups WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 10', 
            [guild.id]
        );
        backups = rows;
    } catch (e) {
        console.error("Erro ao buscar backups do CloudFlow:", e);
    }

    const lastBackup = backups[0];
    const userBackupCount = backups.filter(b => b.user_id === interaction.user.id).length;

    const backupListString = backups.length > 0
        ? backups.map(b => {
            const date = new Date(Number(b.created_at)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return `\`ID: ${b.backup_id}\` - ${b.backup_name.substring(0, 30)} (em ${date})`;
        }).join('\n')
        : '> Nenhum backup encontrado.';
        
    const lastBackupDate = lastBackup 
        ? new Date(Number(lastBackup.created_at)).toLocaleString('pt-BR') 
        : '`N/A`';

    return [
        {
            type: 17, 
            accent_color: 42751, 
            components: [
                {
                    type: 10,
                    content: `## 💾 Dashboard de Backups (CloudFlow)\n**Servidor:** ${guild.name}`
                },
                {
                    type: 10,
                    content: `Crie e restaure backups da **estrutura** do servidor (cargos, canais, permissões). As mensagens e membros **não são** salvos.`
                },

                // --- Infos Úteis ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 10,
                    content: `**Último Backup (Neste Servidor):**\n> ${lastBackupDate}`
                },
                {
                    type: 10,
                    content: `**Seus Backups (Criados aqui):**\n> \`${userBackupCount}\``
                },

                // --- Lista de Backups ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 10,
                    content: `**Últimos 10 Backups (Neste Servidor):**\n${backupListString}`
                },
                
                // --- Seção Criar ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 3, // Verde
                        label: 'Criar Novo Backup',
                        emoji: { name: '➕' }, 
                        custom_id: 'aut_cf_backup_create',
                        disabled: !hasCloudFlow
                    },
                    components: [
                        { type: 10, content: "Criar Novo Backup" },
                        { type: 10, content: `Salva a estrutura atual do servidor com uma senha.` }
                    ]
                },

                // --- Seção Restaurar ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2, // Cinza
                        label: 'Restaurar um Backup',
                        emoji: { name: '🔄' }, 
                        custom_id: 'aut_cf_backup_restore',
                        // --- CORREÇÃO DA REGRA DE NEGÓCIO ---
                        // O usuário pode restaurar um backup de outra guild
                        disabled: !hasCloudFlow
                    },
                    components: [
                        { type: 10, content: "Restaurar um Backup" },
                        { type: 10, content: `Carrega um backup seu de qualquer servidor. Requer ID e Senha.` }
                    ]
                },
                
                // --- Rodapé e Controles ---
                { type: 14, divider: true, spacing: 2 }, 
                {
                    type: 1,
                    components: [
                        {
                            type: 2, style: 2, label: 'Voltar',
                            emoji: { name: '⬅️' }, 
                            custom_id: 'aut_open_cloudflow_menu' // Volta para o menu CloudFlow
                        }
                    ]
                }
            ].filter(Boolean)
        }
    ];
}

module.exports = { buildCloudFlowBackupsMenu };