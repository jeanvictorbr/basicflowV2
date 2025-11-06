// handlers/buttons/dev_manage_keys.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
// REMOVIDO: V2_FLAG, não é mais usado aqui.
const { logEvent } = require('../../utils/webhookLogger.js');

module.exports = {
    customId: 'dev_manage_keys',
    async execute(interaction) {
        try {
            // CORREÇÃO: Usando deferUpdate() LEGACY (sem flags)
            // O "silêncio" indica que a mistura de V2 e Legacy estava falhando.
            await interaction.deferUpdate({ ephemeral: true });

            const itemsPerPage = 10;
            const page = 0; // Ponto de entrada, sempre página 0
            const offset = 0;

            // 1. Handler busca os dados (usando a tabela correta 'activation_keys')
            const keysResult = await db.query('SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY key ASC LIMIT $1 OFFSET $2', [itemsPerPage, offset]);
            const keys = keysResult.rows;

            const totalKeysResult = await db.query('SELECT COUNT(*) FROM activation_keys WHERE uses_left > 0');
            const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;

            // 2. UI (Legacy) formata os dados
            const menu = generateDevKeysMenu(keys, page, totalKeys, totalPages);
            
            // 3. Handler envia a resposta (Legacy)
            // Adiciona 'ephemeral: true' (o modo antigo)
            menu.ephemeral = true; 

            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao gerar devKeysMenu (Legacy):', error);
            try {
                await logEvent(
                    interaction.guildId,
                    'Erro Crítico (dev_manage_keys)',
                    `Erro: ${error.message}\nStack: ${error.stack.substring(0, 1000)}`,
                    { user: interaction.user.id, module: 'DevPanel', type: 'ERROR' }
                );
            } catch (webhookError) {
                console.error('Falha ao enviar log para o webhook:', webhookError.message);
            }

            try {
                // Resposta de erro (Legacy)
                await interaction.editReply({
                    content: '❌ Ocorreu um erro ao carregar o painel de chaves. O erro foi reportado.',
                    embeds: [],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            style: 1, 
                            label: 'Voltar ao Menu',
                            custom_id: 'dev_main_menu_back'
                        }]
                    }],
                    ephemeral: true
                });
            } catch (e) {
                console.error('Erro ao enviar mensagem de erro final:', e.message);
            }
        }
    },
};