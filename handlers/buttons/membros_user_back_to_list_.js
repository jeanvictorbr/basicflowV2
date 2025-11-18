// File: handlers/buttons/membros_user_back_to_list_.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getMemberManagementMenu } = require('../../ui/membros/mainMenu.js');

module.exports = {
    customId: 'membros_user_back_to_list_',
    async execute(interaction) {
        const [, , , , , scope] = interaction.customId.split('_');
        const page = 0;
        const guildId = interaction.guild.id;

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        let membersResult, totalResult;
        let membersData = [];

        try {
            if (scope === 'GUILD') {
                // CORREÇÃO: Tabela 'cloudflow_verified_users'
                membersResult = await db.query(
                    `SELECT user_id 
                     FROM cloudflow_verified_users
                     WHERE guild_id = $1 
                     ORDER BY verified_at ASC
                     LIMIT 10 OFFSET $2`,
                    [guildId, page * 10]
                );
                totalResult = await db.query(
                    'SELECT COUNT(*) FROM cloudflow_verified_users WHERE guild_id = $1',
                    [guildId]
                );
                
                membersData = await Promise.all(membersResult.rows.map(async (row) => {
                    try {
                        const user = await interaction.client.users.fetch(row.user_id);
                        return { user_id: user.id, username: user.username };
                    } catch (e) {
                        return { user_id: row.user_id, username: 'Usuário Desconhecido' };
                    }
                }));

            } else if (scope === 'ALL') {
                // CORREÇÃO: Tabela 'cloudflow_verified_users' global
                membersResult = await db.query(
                    `SELECT DISTINCT user_id
                     FROM cloudflow_verified_users
                     ORDER BY user_id ASC
                     LIMIT 10 OFFSET $1`,
                    [page * 10]
                );
                totalResult = await db.query('SELECT COUNT(DISTINCT user_id) FROM cloudflow_verified_users');
                
                membersData = await Promise.all(membersResult.rows.map(async (row) => {
                    try {
                        const user = await interaction.client.users.fetch(row.user_id);
                        return { user_id: user.id, username: user.username };
                    } catch (e) {
                        return { user_id: row.user_id, username: 'Usuário Global Desconhecido' };
                    }
                }));
            }

            const total = parseInt(totalResult.rows[0].count, 10);
            const isDev = interaction.user.id === process.env.DEV_ID;

            const menu = getMemberManagementMenu(membersData, total, page, scope, isDev);
            await interaction.editReply(menu);

        } catch (error) {
            console.error(`Erro ao voltar para a lista (Scope: ${scope}):`, error);
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245,
                components: [
                    { "type": 10, "content": "❌ Ocorreu um erro ao carregar a lista de membros." }
                ]
            });
        }
    }
};