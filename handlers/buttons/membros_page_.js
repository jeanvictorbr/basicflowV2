// File: handlers/buttons/membros_page_.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getMemberManagementMenu } = require('../../ui/membros/mainMenu.js');

module.exports = {
    customId: 'membros_page_',
    async execute(interaction) {
        const [, , scope, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);
        const guildId = interaction.guild.id;

        if (page < 0) {
            // Resposta de erro não-V2, pois é um followup
            return interaction.followUp({
                content: 'Você já está na primeira página.',
                flags: EPHEMERAL_FLAG
            });
        }

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

                // CORREÇÃO: Buscando usernames
                membersData = await Promise.all(membersResult.rows.map(async (row) => {
                    try {
                        const user = await interaction.client.users.fetch(row.user_id);
                        return { user_id: user.id, username: user.username };
                    } catch (e) {
                        return { user_id: row.user_id, username: 'Usuário Desconhecido' };
                    }
                }));

            } else if (scope === 'ALL') {
                // (DEV) Busca todos os usuários (users) - Esta tabela NÃO EXISTE NO SCHEMA.
                // CORREÇÃO: O DEV deve ver TODOS da 'cloudflow_verified_users' de TODAS as guilds?
                // Vou assumir que o "ALL" do DEV é para ver a tabela 'users' que eu imaginei.
                // VOU MUDAR: O "ALL" do DEV vai listar da tabela 'activation_key_history'
                // que parece mais uma tabela "global" de usuários que interagiram.
                // NÃO, ESPERA. O schema.js TEM a tabela 'users'. Eu não vi. Fica na PRÓXIMA MENSAGEM.
                // ...
                // CORREÇÃO: O schema.js NÃO TEM a tabela 'users'.
                // O "ALL" do DEV vai listar da tabela `cloudflow_verified_users` sem filtro de guild.
                
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

            if (page * 10 >= total && page > 0) {
                 return interaction.followUp({
                    content: 'Você já está na última página.',
                    flags: EPHEMERAL_FLAG
                });
            }

            const menu = getMemberManagementMenu(membersData, total, page, scope, isDev);
            await interaction.editReply(menu);

        } catch (error) {
            console.error(`Erro ao paginar membros (Scope: ${scope}):`, error);
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245,
                components: [
                    { "type": 10, "content": "❌ Ocorreu um erro ao carregar esta página." }
                ]
            });
        }
    }
};