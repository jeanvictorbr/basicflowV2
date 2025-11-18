// handlers/buttons/membros_view_all.js

const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getMemberManagementMenu } = require('../../ui/membros/mainMenu.js'); // A UI está correta

module.exports = {
    customId: 'membros_view_all',
    async execute(interaction) {
        if (!process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
            // ===================================================================
            //  ⬇️  CORREÇÃO DO CATCH V2 (Aplicado aqui também) ⬇️
            // ===================================================================
            return interaction.reply({
                type: 17, // V2
                content: 'Acesso negado.',
                flags: EPHEMERAL_FLAG,
                embeds: [],
                components: []
            });
            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================
        }

        const page = 0;
        const scope = 'ALL';

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // ===================================================================
            //  ⬇️  CORREÇÃO DA QUERY SQL ⬇️
            // ===================================================================
            // Removemos a referência à 'user_profiles' e 'username_cache'
            // que não existem no schema.js.
            const membersResult = await db.query(
                `SELECT DISTINCT user_id
                 FROM cloudflow_verified_users
                 ORDER BY user_id ASC
                 LIMIT 10 OFFSET $1`,
                [page * 10]
            );

            // A contagem total está correta
            const totalResult = await db.query('SELECT COUNT(DISTINCT user_id) FROM cloudflow_verified_users');
            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================

            // Mapeia o user_id para o formato que a UI espera
            const members = membersResult.rows.map(row => ({
                user_id: row.user_id,
                username: row.user_id // Usando ID como fallback, já que o schema não tem o nome
            }));

            const total = parseInt(totalResult.rows[0].count, 10);
            const isDev = true;

            const menu = getMemberManagementMenu(members, total, page, scope, isDev);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao buscar todos os usuários (DEV):', error);
            // ===================================================================
            //  ⬇️  CORREÇÃO DO CATCH V2 ⬇️
            // ===================================================================
            await interaction.editReply({
                type: 17, // Resposta V2
                content: 'Ocorreu um erro ao buscar a lista global de usuários.',
                flags: EPHEMERAL_FLAG,
                embeds: [],
                components: []
            });
            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================
        }
    }
};