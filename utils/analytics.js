// Crie este novo arquivo em: utils/analytics.js
const db = require('../database');

/**
 * Extrai o nome do módulo a partir do customId ou nome do comando.
 * @param {string} name O nome do comando ou customId.
 * @returns {string} O nome do módulo.
 */
function getModuleName(name) {
    if (!name) return 'Desconhecido';
    
    // Mapeamento de prefixos para módulos
    const moduleMappings = [
        { prefixes: ['ponto_', 'ranking'], module: 'Ponto' },
        { prefixes: ['ticket_', 'feedback_'], module: 'Tickets' },
        { prefixes: ['suggestion_', 'suggestions_'], module: 'Sugestões' },
        { prefixes: ['store_', 'cart_', 'pay_'], module: 'StoreFlow' },
        { prefixes: ['mod_', 'warn', 'ban', 'kick', 'timeout'], module: 'Moderação' },
        { prefixes: ['guardian_'], module: 'GuardianAI' },
        { prefixes: ['dev_'], module: 'DevPanel' },
        { prefixes: ['configurar', 'main_', 'open_'], module: 'Configuração' },
        { prefixes: ['forca', 'stop', 'hangman_', 'minigames_'], module: 'MiniGames' },
        { prefixes: ['ausencia_'], module: 'Ausências' },
        { prefixes: ['registros_'], module: 'Registros' },
        { prefixes: ['uniformes_'], module: 'Uniformes' },
        { prefixes: ['roletags_'], module: 'RoleTags' },
        { prefixes: ['welcome_', 'goodbye_'], module: 'Boas-Vindas' }
    ];

    for (const mapping of moduleMappings) {
        for (const prefix of mapping.prefixes) {
            if (name.startsWith(prefix)) {
                return mapping.module;
            }
        }
    }

    return 'Geral';
}

/**
 * Registra uma interação na base de dados.
 * @param {import('discord.js').Interaction} interaction A interação que ocorreu.
 */
async function logInteraction(interaction) {
    if (!interaction.guild) return; // Não registrar interações em DMs

    try {
        let type;
        let name;

        if (interaction.isCommand()) {
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
            return; // Tipo de interação não suportado para logging
        }

        const module = getModuleName(name);

        await db.query(
            'INSERT INTO interaction_logs (guild_id, user_id, type, name, module) VALUES ($1, $2, $3, $4, $5)',
            [interaction.guild.id, interaction.user.id, type, name, module]
        );
    } catch (error) {
        console.error('[Analytics] Falha ao registrar interação:', error);
    }
}

/**
 * Registra uma ação significativa do bot.
 * @param {string} guildId O ID do servidor onde a ação ocorreu.
 * @param {string} module O nome do módulo responsável pela ação.
 * @param {string} action A descrição da ação.
 * @param {string} [userId] O ID do usuário que iniciou a ação (opcional).
 */
async function logAction(guildId, module, action, userId = null) {
    try {
        await db.query(
            'INSERT INTO bot_action_logs (guild_id, module, action, user_id) VALUES ($1, $2, $3, $4)',
            [guildId, module, action, userId]
        );
    } catch (error) {
        console.error('[Analytics] Falha ao registrar ação:', error);
    }
}


module.exports = { logInteraction, logAction };