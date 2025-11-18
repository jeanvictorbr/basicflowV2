// File: utils/devPanelUtils.js
// CONTEÚDO COMPLETO E ATUALIZADO

const db = require('../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('./constants.js');

// Função para buscar o status do bot
async function getBotStatus() {
    const status = await db.query('SELECT * FROM bot_status');
    return status.rows[0];
}

// Função para buscar e separar as guilds
// (Esta função já existia mas não estava sendo exportada)
async function getGuilds(client) {
    const guilds = await client.guilds.fetch();
    const devGuilds = [];
    const allGuilds = [];
    const devGuildId = process.env.DEV_GUILD_ID;

    for (const [id, oauthGuild] of guilds) {
        try {
            const guild = await oauthGuild.fetch();
            const guildData = {
                id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
            };
            if (id === devGuildId) {
                devGuilds.push(guildData);
            }
            allGuilds.push(guildData);
        } catch (fetchError) {
            console.warn(`[getGuilds] Falha ao fazer fetch da guild ${id}: ${fetchError.message}`);
        }
    }
    return { devGuilds, allGuilds };
}


// Função para formatar as guilds para V2
async function formatGuilds(client) {
    const { devGuilds, allGuilds } = await getGuilds(client);

    const format = (guildsList) => {
        if (!guildsList || guildsList.length === 0) {
            return [{ label: "Nenhum servidor encontrado", value: "null" }];
        }
        return guildsList.map(guild => ({
            label: guild.name,
            value: guild.id,
            description: `ID: ${guild.id} | Membros: ${guild.memberCount}`
        }));
    };

    return {
        devGuildOptions: format(devGuilds),
        allGuildOptions: format(allGuilds)
    };
}

// ===================================================================
//  ⬇️  A CORREÇÃO ESTÁ AQUI  ⬇️
// ===================================================================
module.exports = {
    getBotStatus,
    getGuilds, // ADICIONAMOS A FUNÇÃO QUE FALTAVA
    formatGuilds
};
// ===================================================================
//  ⬆️  FIM DA CORREÇÃO ⬆️
// ===================================================================