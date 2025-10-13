// Crie em: utils/analyticsUtils.js
const db = require('../database.js');

const MODULE_MAP = {
    'ponto': 'Ponto',
    'ticket': 'Tickets',
    'store': 'StoreFlow',
    'suggestion': 'Sugestões',
    'registro': 'Registros',
    'ausencia': 'Ausências',
    'uniforme': 'Uniformes',
    'mod': 'Moderação',
    'guardian': 'Guardian AI',
    'dev': 'Dev Panel',
    'hangman': 'Mini-Games',
    'stop': 'Mini-Games',
    'forca': 'Mini-Games',
    'configurar': 'Configuração',
    'default': 'Geral'
};

function getModuleFromId(id) {
    if (!id) return MODULE_MAP.default;
    const prefix = id.split('_')[0];
    return MODULE_MAP[prefix] || MODULE_MAP.default;
}

async function logInteraction(interaction) {
    if (!interaction.guild) return; // Não registra interações em DMs

    let type, name, module;

    if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
        type = 'command';
        name = interaction.commandName;
    } else if (interaction.isButton()) {
        type = 'button';
        name = interaction.customId;
    } else if (interaction.isModalSubmit()) {
        type = 'modal';
        name = interaction.customId;
    } else if (interaction.isAnySelectMenu()) {
        type = 'select';
        name = interaction.customId;
    } else {
        return; // Tipo de interação não rastreado
    }

    module = getModuleFromId(name);

    try {
        await db.query(
            'INSERT INTO interaction_logs (guild_id, user_id, type, name, module) VALUES ($1, $2, $3, $4, $5)',
            [interaction.guild.id, interaction.user.id, type, name, module]
        );
    } catch (error) {
        console.error('[Analytics Logger] Falha ao registrar interação:', error);
    }
}

async function getGlobalAnalytics(days = 7) {
    const interval = `${days} days`;

    const [
        generalStats,
        topCommands,
        topButtons,
        topModules,
        topGuilds
    ] = await Promise.all([
        db.query(`
            SELECT
                COUNT(*) AS total_interactions,
                COUNT(DISTINCT guild_id) AS active_guilds,
                COUNT(DISTINCT user_id) AS active_users
            FROM interaction_logs
            WHERE timestamp >= NOW() - $1::interval
        `, [interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE type = 'command' AND timestamp >= NOW() - $1::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE type = 'button' AND timestamp >= NOW() - $1::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [interval]),
        db.query(`SELECT module, COUNT(*) as count FROM interaction_logs WHERE timestamp >= NOW() - $1::interval GROUP BY module ORDER BY count DESC LIMIT 5`, [interval]),
        db.query(`SELECT guild_id, COUNT(*) as count FROM interaction_logs WHERE timestamp >= NOW() - $1::interval GROUP BY guild_id ORDER BY count DESC LIMIT 5`, [interval]),
    ]);

    return {
        general: generalStats.rows[0],
        topCommands: topCommands.rows,
        topButtons: topButtons.rows,
        topModules: topModules.rows,
        topGuilds: topGuilds.rows,
    };
}

module.exports = { logInteraction, getGlobalAnalytics };