// handlers/buttons/dev_manage_keys.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'dev_manage_keys',
    async execute(interaction) {
        try {
            // Usa deferUpdate, mas vamos responder com editReply usando flags V2
            await interaction.deferUpdate();

            const itemsPerPage = 5; // Reduzi para 5 para caber melhor na tela V2 sem scroll excessivo
            const page = 0; 
            const offset = 0;

            // 1. Busca chaves ativas
            const keysResult = await db.query(
                'SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY created_at DESC LIMIT $1 OFFSET $2', 
                [itemsPerPage, offset]
            );
            const keys = keysResult.rows;

            // 2. Conta total
            const totalKeysResult = await db.query('SELECT COUNT(*) FROM activation_keys WHERE uses_left > 0');
            const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;

            // 3. Gera UI V2
            const menuV2 = generateDevKeysMenu(keys, page, totalKeys, totalPages);
            
            // 4. Atualiza a mensagem
            // Nota: components recebe um array com o layout V2
            await interaction.editReply({
                content: "", // Limpa conteúdo legado se houver
                components: [menuV2],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro no dev_manage_keys:', error);
            // Resposta de erro simples em V2
            const errorLayout = {
                type: 17,
                components: [
                    { type: 10, content: `❌ **Erro ao carregar chaves:** ${error.message}` },
                    { type: 1, components: [{ type: 2, style: 2, label: "Voltar", custom_id: "dev_main_menu_back" }] }
                ]
            };
            
            await interaction.editReply({ components: [errorLayout], flags: V2_FLAG | EPHEMERAL_FLAG });
        }
    },
};