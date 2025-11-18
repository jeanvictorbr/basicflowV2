// File: handlers/buttons/aut_oauth_manage_members.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getMemberManagementMenu } = require('../../ui/membros/mainMenu.js');

module.exports = {
    customId: 'aut_oauth_manage_members',
    async execute(interaction) {
        
        const guildId = interaction.guild.id;
        const page = 0;
        const scope = 'GUILD'; // O escopo inicial é a Guild atual

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // CORREÇÃO: Usando a tabela 'cloudflow_verified_users'
            const membersResult = await db.query(
                `SELECT user_id 
                 FROM cloudflow_verified_users
                 WHERE guild_id = $1 
                 ORDER BY verified_at ASC
                 LIMIT 10 OFFSET $2`,
                [guildId, page * 10]
            );

            // CORREÇÃO: Buscando usernames via API
            const membersData = await Promise.all(membersResult.rows.map(async (row) => {
                try {
                    const user = await interaction.client.users.fetch(row.user_id);
                    return { user_id: user.id, username: user.username };
                } catch (e) {
                    return { user_id: row.user_id, username: 'Usuário Desconhecido' };
                }
            }));

            // CORREÇÃO: Contando da tabela correta
            const totalResult = await db.query(
                'SELECT COUNT(*) FROM cloudflow_verified_users WHERE guild_id = $1',
                [guildId]
            );

            const total = parseInt(totalResult.rows[0].count, 10);
            const isDev = interaction.user.id === process.env.DEV_ID;

            const menu = getMemberManagementMenu(membersData, total, page, scope, isDev);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao buscar membros verificados:', error);
            // CORREÇÃO: Usando o catch V2 puro
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245, // Vermelho
                components: [
                    { "type": 10, "content": "❌ Ocorreu um erro ao buscar a lista de membros." }
                ]
            });
        }
    },
};