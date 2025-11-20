// ui/automations/cloudflowMenu.js
const db = require('../../database');
const hasFeature = require('../../utils/featureCheck.js');

/**
 * Constrói o menu principal do CloudFlow (Padrão V2 Type 17)
 * @param {Interaction} interaction - A interação original.
 * @returns {Promise<Array<object>>} - A estrutura V2 da mensagem.
 */
async function buildCloudFlowMenu(interaction) {

    // 1. Verifica a feature (a mesma de automations ou uma nova 'CLOUDFLOW')
    const hasCloudFlow = await hasFeature(interaction.guild.id, 'AUTOMATIONS');
    
    // 2. Busca contagens (Exemplo)
    const { rows: backups } = await db.query('SELECT COUNT(*) as count FROM cloudflow_backups WHERE guild_id = $1', [interaction.guild.id]);
    const backupCount = backups[0] ? backups[0].count : 0;
    
    const { rows: verified } = await db.query('SELECT COUNT(*) as count FROM cloudflow_verified_users WHERE guild_id = $1', [interaction.guild.id]);
    const verifiedCount = verified[0] ? verified[0].count : 0;


    return [
        {
            type: 17, // Estrutura V2
            accent_color: 42751, // Cor do /configurar
            components: [
                {
                    type: 10,
                    content: "## ☁️ CloudFlow"
                },
                {
                    type: 10,
                    content: `Gerencie a verificação de membros e os backups de estrutura do seu servidor.`
                },
                
                // --- Seção de Verificação OAuth2 ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2, 
                        label: 'Configurar',
                        emoji: { name: '🔐' }, 
                        custom_id: 'aut_cf_manage_oauth',
                        disabled: !hasCloudFlow
                    },
                    components: [
                        { type: 10, content: "🔐 Verificação OAuth2" },
                        { type: 10, content: `Sistema de autenticação de membros. Verificados: \`${verifiedCount}\`` }
                    ]
                },

                // --- Seção de Backups ---
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 9,
                    accessory: {
                        type: 2, style: 2,
                        label: 'Gerenciar',
                        emoji: { name: '💾' }, 
                        custom_id: 'aut_cf_manage_backups',
                        disabled: !hasCloudFlow
                    },
                    components: [
                        { type: 10, content: "💾 Backups do Servidor" },
                        { type: 10, content: `Crie e restaure backups de estrutura. Salvos: \`${backupCount}\`` }
                    ]
                },
                
                // --- Rodapé e Controles ---
                { type: 14, divider: true, spacing: 2 }, 
                {
                    type: 1,
                    components: [
                        {
                            type: 2, style: 2, label: 'Voltar',
                            emoji: { name: '⬅️' }, custom_id: 'open_automations_menu' // Volta para o menu de automações
                        }
                    ]
                }
            ].filter(Boolean)
        }
    ];
}

module.exports = { buildCloudFlowMenu };