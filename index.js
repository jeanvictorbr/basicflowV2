// File: index.js
// CONTEÚDO COMPLETO E CORRIGIDO COM OTIMIZAÇÃO DE RAM
require('dotenv').config();
const fs = require('node:fs');
const { checkExpiringFeatures } = require('./utils/premiumExpiryMonitor.js');
const { startPurgeMonitor } = require('./utils/purgeMonitor');
const { checkTokenUsage } = require('./utils/tokenMonitor.js');
const { startPontoUpdateLoop } = require('./utils/pontoLogLoop.js');
const voiceHubManager = require('./utils/voiceHubManager.js');
const MusicOrchestrator = require('./utils/MusicOrchestrator.js');
const path = require('node:path');
const automationsMonitor = require('./utils/automationsMonitor.js');
const { EPHEMERAL_FLAG } = require('./utils/constants');
// ADICIONADO 'Options' NA IMPORTAÇÃO ABAIXO
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ChannelType, EmbedBuilder, PermissionsBitField, ActivityType, Options } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js');
const { processMessageForGuardian } = require('./utils/guardianAI.js');
const { checkExpiredPunishments } = require('./utils/punishmentMonitor.js');
const { updateUserTag } = require('./utils/roleTagUpdater.js');
const { checkInactiveCarts } = require('./utils/storeInactivityMonitor.js');
const { checkExpiredRoles } = require('./utils/storeRoleMonitor.js');
const { syncUsedKeys } = require('./utils/keyStockMonitor.js');
const { logInteraction } = require('./utils/analyticsUtils.js');
const MODULES = require('./config/modules.js');
const { updateModuleStatusCache } = require('./utils/moduleStatusCache.js');
const { splitMessage } = require('./utils/messageSplitter');
const { startStatsMonitor } = require('./utils/statsMonitor.js');
const { startVerificationLoop } = require('./utils/verificationLoop');
const hasFeature = require('./utils/featureCheck.js');
const db = require('./database.js');
const http = require('http');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { approvePurchase } = require('./utils/approvePurchase.js');
const { startGiveawayMonitor } = require('./utils/giveawayManager');
const restorePontoSessions = require('./utils/pontoRestore.js'); 

const url = require('url');
const crypto = require('crypto');
const axios = require('axios');

// --- OTIMIZAÇÃO DE MEMÓRIA APLICADA AQUI ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMembers
    ],
    // Configuração para limitar o uso de RAM (Cache)
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        // Mantém apenas as últimas 20 mensagens por canal (Suficiente para IA e comandos)
        // Isso impede que o bot guarde milhares de mensagens antigas na RAM
        MessageManager: 20, 
        // Desativa cache de reações (economiza objetos)
        ReactionManager: 0,
        // Limita threads arquivadas
        ThreadManager: {
            maxSize: 25,
            keepOverLimit: (thread) => !thread.archived,
        },
    }),
    // Limpeza automática (Garbage Collection) a cada hora
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 3600, // Limpa a cada 1 hora
            lifetime: 1800, // Remove mensagens com mais de 30 minutos da memória
        },
    },
});
// -------------------------------------------

automationsMonitor.start(client);
client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();
client.hangmanTimeouts = new Map();
client.moduleStatusCache = new Map();
client.on('voiceStateUpdate', (oldState, newState) => {
    voiceHubManager(oldState, newState, client);
});


// ===================================================================
//  ⬇️  COLEÇÕES DE HANDLERS CORRIGIDAS  ⬇️
// ===================================================================
client.commandHandlers = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selects = new Collection();
// ===================================================================
//  ⬆️  FIM DA CORREÇÃO ⬆️
// ===================================================================

// --- FUNÇÕES DE CRIPTOGRAFIA ADICIONADAS ---
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(process.env.DISCORD_TOKEN)).digest('base64').substr(0, 32);

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
    } catch (e) {
        console.error('[Crypto] Erro ao encriptar:', e);
        return null;
    }
}

// --- FUNÇÃO SEGURA PARA COR ---
function resolveSafeColor(colorInput) {
    // Regex para verificar Hex de 3 ou 6 digitos (com # opcional)
    const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (colorInput && hexRegex.test(colorInput)) {
        return colorInput.startsWith('#') ? colorInput : `#${colorInput}`;
    }
    return '#2ECC71'; // Cor padrão segura (Verde)
}
// -------------------------------------------

const commandUsage = new Map();
const COMMAND_THRESHOLD = 15;
const COMMAND_TIMEFRAME = 60 * 1000;

client.on(Events.GuildMemberAdd, async (member) => {
    const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
    const settings = settingsResult.rows[0];
    if (!settings || !settings.welcome_enabled || !settings.welcome_channel_id) return;
    if (settings.autorole_id) {
        try {
            const role = await member.guild.roles.fetch(settings.autorole_id);
            if (role) await member.roles.add(role);
        } catch (error) {
            console.error(`[Welcome] Falha ao adicionar autorole para ${member.user.tag}:`, error);
        }
    }
    const welcomeChannel = await member.guild.channels.fetch(settings.welcome_channel_id).catch(() => null);
    if (!welcomeChannel) return;
    const config = settings.welcome_message_config || {};
    const isPremium = await hasFeature(member.guild.id, 'CUSTOM_VISUALS');
    const replacePlaceholders = (text) => {
        if (!text) return '';
        return text
            .replace(/{user.mention}/g, `<@${member.id}>`)
            .replace(/{user.tag}/g, member.user.tag)
            .replace(/{server.name}/g, member.guild.name)
            .replace(/{member.count}/g, member.guild.memberCount.toString());
    };
    const finalTitle = replacePlaceholders(config.title || '👋 Bem-vindo(a) ao {server.name}!');
    const finalDescription = replacePlaceholders(config.description || 'Estamos felizes em ter você aqui, {user.mention}! Esperamos que você se divirta e faça novas amizades.');
    const finalFooter = isPremium && config.footer_text ? replacePlaceholders(config.footer_text) : 'Junte-se à nossa comunidade!';
    const safeColor = resolveSafeColor(config.color);
    const welcomeEmbed = new EmbedBuilder()
        .setColor(config.color || '#2ECC71')
        .setTitle(finalTitle)
        .setDescription(finalDescription)
        .setImage(config.image_url && config.image_url.includes('http') ? config.image_url : null)
        .setThumbnail(isPremium && config.thumbnail_url ? config.thumbnail_url : member.user.displayAvatarURL())
        .setFooter({ text: finalFooter })
        .setTimestamp();
    try {
        await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
        console.error(`[Welcome] Falha ao enviar mensagem de boas-vindas no servidor ${member.guild.name}:`, error);
    }
});


// --- INÍCIO DA NOVA LÓGICA DE DESPEDIDA ---
client.on(Events.GuildMemberRemove, async (member) => {
    const settingsResult = await db.query('SELECT goodbye_enabled, goodbye_channel_id, goodbye_message_text FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
    const settings = settingsResult.rows[0];
    
    // Verifica se o sistema está ativado e se o canal está configurado
    if (!settings || !settings.goodbye_enabled || !settings.goodbye_channel_id) return;

    const goodbyeChannel = await member.guild.channels.fetch(settings.goodbye_channel_id).catch(() => null);
    if (!goodbyeChannel) {
        console.error(`[Goodbye] Canal de despedida ${settings.goodbye_channel_id} não encontrado no servidor ${member.guild.name}.`);
        return;
    }

    // Substitui os placeholders
    const messageText = (settings.goodbye_message_text || '👋 {user.tag} deixou o servidor.')
        .replace(/{user.mention}/g, `<@${member.id}>`)
        .replace(/{user.tag}/g, member.user.tag)
        .replace(/{user.name}/g, member.user.username)
        .replace(/{server.name}/g, member.guild.name)
        .replace(/{member.count}/g, member.guild.memberCount.toString());

    try {
        await goodbyeChannel.send(messageText);
    } catch (error) {
        console.error(`[Goodbye] Falha ao enviar mensagem de despedida no servidor ${member.guild.name}:`, error);
    }
});
// --- FIM DA NOVA LÓGICA DE DESPEDIDA ---

// --- INÍCIO DA CORREÇÃO DO ROLETAGS ---
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    // Verifica se os cargos do membro realmente mudaram.
    // Isso evita que a função rode em atualizações de status, apelido, etc.
    const rolesChanged = oldMember.roles.cache.size !== newMember.roles.cache.size ||
                          !oldMember.roles.cache.every((role) => newMember.roles.cache.has(role.id));

    if (rolesChanged) {
        try {
            // A função updateUserTag (já importada no topo do index.js)
            // contém toda a lógica necessária, incluindo a verificação
            // se o sistema está ativo no servidor.
            await updateUserTag(newMember);
        } catch (error) {
            console.error(`[RoleTag] Falha ao atualizar a tag para ${newMember.user.tag}:`, error);
        }
    }
});
// --- FIM DA CORREÇÃO DO ROLETAGS ---

client.on(Events.GuildCreate, async guild => {
    if (!process.env.GUILD_ADD_WEBHOOK_URL) {
        console.log(`[GUILD JOIN] Bot adicionado ao servidor ${guild.name} (${guild.id}), mas o webhook de notificação não está configurado.`);
        return;
    }
    try {
        const owner = await guild.fetchOwner();
        const joinEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🎉 Novo Servidor Adicionado!')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Servidor', value: `**${guild.name}**\n\`${guild.id}\``, inline: true },
                { name: 'Membros', value: `\`${guild.memberCount}\``, inline: true },
                { name: 'Dono', value: `${owner.user.tag}\n\`${owner.id}\``, inline: false },
                { name: 'Criado em', value: `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:f>`, inline: true }
            )
            .setTimestamp();
        const payload = {
            username: 'Koda Alertas',
            avatar_url: client.user.displayAvatarURL(),
            embeds: [joinEmbed]
        };
        await fetch(process.env.GUILD_ADD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log(`[GUILD JOIN] Notificação enviada para o webhook sobre o servidor ${guild.name}.`);
    } catch (error) {
        console.error(`[GUILD JOIN] Falha ao enviar notificação para o webhook:`, error);
    }
});
client.on(Events.GuildDelete, async guild => {
    if (!process.env.GUILD_REMOVE_WEBHOOK_URL) {
        console.log(`[GUILD LEAVE] Bot removido do servidor ${guild.name} (${guild.id}), mas o webhook de notificação não está configurado.`);
        return;
    }
    try {
        const joinedAtTimestamp = Math.floor(guild.joinedTimestamp / 1000);
        const timeInGuild = `<t:${joinedAtTimestamp}:R>`;
        const leaveEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('❌ Bot Removido de um Servidor!')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Servidor', value: `**${guild.name}**\n\`${guild.id}\``, inline: true },
                { name: 'Membros no momento da saída', value: `\`${guild.memberCount || 'N/A'}\``, inline: true },
                { name: 'Estava no servidor desde', value: timeInGuild, inline: false }
            )
            .setTimestamp();
        const payload = {
            username: 'Koda Alertas',
            avatar_url: client.user.displayAvatarURL(),
            embeds: [leaveEmbed]
        };
        await fetch(process.env.GUILD_REMOVE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log(`[GUILD LEAVE] Notificação de remoção enviada para o webhook sobre o servidor ${guild.name}.`);
    } catch (error) {
        console.error(`[GUILD LEAVE] Falha ao enviar notificação para o webhook:`, error);
    }
});
client.commands = new Collection();
const commandsToDeploy = [];
const devCommandsToDeploy = [];
const devOnlyCommands = ['devpanel', 'debugai'];
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandFoldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandFoldersPath, file));
    if (command.data) {
        client.commands.set(command.data.name, command);
        if (devOnlyCommands.includes(command.data.name)) {
            devCommandsToDeploy.push(command.data.toJSON());
        } else {
            commandsToDeploy.push(command.data.toJSON());
        }
    }
}

// ===================================================================
//  ⬇️  LÓGICA DE CARREGAMENTO DE HANDLERS CORRIGIDA  ⬇️
// ===================================================================
console.log('--- Carregando Handlers ---');
const handlersPath = path.join(__dirname, 'handlers');

// 1. Carregar Handlers de Comandos (por nome de arquivo)
try {
    const commandHandlersPath = path.join(handlersPath, 'commands');
    const commandHandlerFiles = fs.readdirSync(commandHandlersPath).filter(file => file.endsWith('.js'));
    for (const file of commandHandlerFiles) {
        try {
            const handler = require(path.join(commandHandlersPath, file));
            const commandName = file.split('.')[0];
            
            // ===================================================================
            //  ⬇️  A CORREÇÃO ESTÁ AQUI  ⬇️
            // ===================================================================
            // Verifica se o handler é uma função direta (ex: module.exports = async (...) => ...)
            if (typeof handler === 'function') {
                client.commandHandlers.set(commandName, handler);
            } 
            // Verifica o padrão antigo (ex: module.exports = { execute: ... })
            else if (handler.execute && typeof handler.execute === 'function') {
                client.commandHandlers.set(commandName, handler.execute);
            } 
            // Se não for nenhum dos dois, avisa o erro
            else {
                console.warn(`[HANDLER] ⚠️ Handler de comando ${file} não é uma função válida ou não possui 'execute'.`);
            }
            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================

        } catch (error) {
            console.error(`[HANDLER] ❌ Erro ao carregar comando ${file}:`, error);
        }
    }
    console.log(`[HANDLER] ✅ ${client.commandHandlers.size} handlers de comando carregados.`);
} catch (error) {
    console.error('[HANDLER] ❌ Falha ao ler o diretório de handlers de comando:', error);
}

// 2. Carregar Handlers de Componentes (por customId)
const componentTypes = ['buttons', 'modals', 'selects'];
componentTypes.forEach(type => {
    try {
        const componentDir = path.join(handlersPath, type);
        if (fs.existsSync(componentDir)) {
            const componentFiles = fs.readdirSync(componentDir).filter(file => file.endsWith('.js'));
            for (const file of componentFiles) {
                try {
                    const handler = require(path.join(componentDir, file));
                    if (handler.customId && handler.execute) {
                        // Usa a collection correta (client.buttons, client.modals, etc.)
                        client[type].set(handler.customId, handler);
                    } else {
                        console.warn(`[HANDLER] ⚠️ ${type} handler ${file} não possui 'customId' ou 'execute'.`);
                    }
                } catch (error) {
                    console.error(`[HANDLER] ❌ Erro ao carregar ${type} ${file}:`, error);
                }
            }
            console.log(`[HANDLER] ✅ ${client[type].size} handlers de ${type} carregados.`);
        } else {
            console.warn(`[HANDLER] ⚠️ Diretório para ${type} não encontrado.`);
        }
    } catch (error) {
        console.error(`[HANDLER] ❌ Falha ao ler o diretório de handlers de ${type}:`, error);
    }
});
// ===================================================================
//  ⬆️  FIM DA CORREÇÃO DO CARREGAMENTO ⬆️
// ===================================================================


console.log('--- Handlers Carregados ---');



client.once(Events.ClientReady, async () => {
    startPontoUpdateLoop(client);
    startGiveawayMonitor(client);
   // startVerificationLoop(client);
    startStatsMonitor(client);
    await db.synchronizeDatabase();
    try {
        startPurgeMonitor(client, db); // Inicia o cronjob
    } catch(e) { console.error('[Monitor] Erro ao iniciar Purge:', e); }

    await updateModuleStatusCache(client);
    
    // --- CORREÇÃO PONTO: RESTAURAR INTERVALOS ---
    await restorePontoSessions(client);
    // ---------------------------------------------
// --- INICIAR ORQUESTRA DE MÚSICA ---
    try {
        await MusicOrchestrator.start(); 
    } catch (e) {
        console.error('[Music] Falha ao iniciar orquestra:', e);
    }
    // -----------------------------------
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        if (process.env.DEV_GUILD_ID) {
            const allDevGuildCommands = [...commandsToDeploy, ...devCommandsToDeploy];
            console.log(`[CMD] Iniciando registo de ${allDevGuildCommands.length} comando(s) na guild de desenvolvimento.`);
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: allDevGuildCommands },
            );
            console.log(`[CMD] Comandos registados com sucesso na guild de desenvolvimento.`);
        } else {
            console.log(`[CMD] Iniciando registo de ${commandsToDeploy.length} comando(s) globais.`);
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commandsToDeploy },
            );
            console.log(`[CMD] Comandos registados globalmente com sucesso.`);
        }
    } catch (error) {
        console.error('[CMD] Erro ao registar comandos:', error);
    }
    console.log(`🚀 Bot online! Logado como ${client.user.tag}`);

    // --- INÍCIO DA ALTERAÇÃO DO STATUS EM TEMPO REAL ---
    const updateBotStatus = () => {
        // Calcula o total de membros em todos os servidores onde o bot está
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        // Define o status
        client.user.setPresence({
            activities: [{ 
                name: `Atendendo ${totalMembers.toLocaleString('pt-BR')} usuários`, 
                type: ActivityType.Playing // Exibirá: "Jogando Atendendo X usuários"
            }],
            status: 'online'
        });
        // console.log(`[Status] Atualizado para: Atendendo ${totalMembers} usuários`);
    };

    // Atualiza imediatamente e agenda para rodar a cada 10 minutos
    updateBotStatus();
    setInterval(updateBotStatus, 5 * 60 * 1000);
    // --- FIM DA ALTERAÇÃO DO STATUS ---
    setInterval(() => checkAndCloseInactiveTickets(client), 5 * 60 * 1000);
    setInterval(() => checkExpiredPunishments(client), 1 * 60 * 1000);
    setInterval(() => checkInactiveCarts(client), 10 * 60 * 1000);
    setInterval(() => checkExpiredRoles(client), 60 * 60 * 1000);
    setInterval(() => checkExpiringFeatures(client), 24 * 60 * 60 * 1000);
    
    setInterval(() => syncUsedKeys(client), 60 * 1000);
    setInterval(() => updateModuleStatusCache(client), 15 * 60 * 1000);
    setInterval(() => checkTokenUsage(client), 15 * 60 * 1000); 
});

// ===================================================================
//  ⬇️  ROTEADOR DE INTERAÇÃO CORRIGIDO  ⬇️
// ===================================================================
client.on(Events.InteractionCreate, async interaction => {
    
    // Obter configurações da guilda (essencial para verificações)
    const guildSettings = await db.getGuildSettings(interaction.guildId);
    if (!guildSettings && interaction.guildId) {
        // Se não houver configurações, é provável que a guilda não esteja no DB.
        // Apenas comandos de devpanel e ativar devem funcionar.
        if (interaction.isChatInputCommand() && 
            interaction.commandName !== 'devpanel' && 
            interaction.commandName !== 'configurar') {
            
            return interaction.reply({ 
                content: '❌ Este servidor não parece estar registrado corretamente no meu banco de dados. Use `/configurar` (se for admin) ou contate o suporte.', 
                ephemeral: true 
            });
        }
    }

    // Verificação de Manutenção (baseado nas settings)
    if (guildSettings && guildSettings.maintenance_mode) {
        if (!process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
            const maintenanceMessage = guildSettings.maintenance_message || 'O bot está em manutenção no momento. Tente novamente mais tarde.';
            if (interaction.isChatInputCommand() || interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
                try {
                    await interaction.reply({ content: `⚠️ **Manutenção**\n${maintenanceMessage}`, flags: EPHEMERAL_FLAG });
                } catch (e) {}
            }
            return;
        }
    }
    
    try {
        
        // 1. Handle Chat Input Commands
        if (interaction.isChatInputCommand()) {
            // Get the DEFINITION (from /commands)
            const command = client.commands.get(interaction.commandName);
            if (!command) return; // Definition not found

            // Get the HANDLER (from /handlers/commands)
            const commandHandler = client.commandHandlers.get(interaction.commandName);
            
            if (!commandHandler) {
                console.error(`[HANDLER] ❌ Handler de comando não encontrado para: ${interaction.commandName}`);
                return interaction.reply({ content: '❌ Erro: O handler de execução para este comando não foi encontrado.', flags: EPHEMERAL_FLAG });
            }

            // Module/Admin checks (from definition file)
            if (command.module) {
                const moduleStatus = client.moduleStatusCache.get(command.module);
                if (moduleStatus && !moduleStatus.is_enabled) {
                    return interaction.reply({ 
                        content: `❌ O módulo \`${command.module}\` está desativado globalmente.`, 
                        flags: EPHEMERAL_FLAG 
                    });
                }
            }
            if (command.adminOnly) {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ 
                        content: '❌ Você precisa de permissão de Administrador para usar este comando.', 
                        flags: EPHEMERAL_FLAG 
                    });
                }
            }
            
            // Execute the HANDLER
            await commandHandler(interaction, guildSettings);

        // 2. Handle Buttons
        } else if (interaction.isButton()) {
            const handler = client.buttons.get(interaction.customId);
            if (handler) {
                await handler.execute(interaction, guildSettings);
            } else {
                // Dynamic button logic
                const dynamicHandler = client.buttons.find(b => interaction.customId.startsWith(b.customId));
                if (dynamicHandler) {
                    await dynamicHandler.execute(interaction, guildSettings);
                }
            }

        // 3. Handle Modals
        } else if (interaction.isModalSubmit()) {
            const handler = client.modals.get(interaction.customId);
            if (handler) {
                await handler.execute(interaction, guildSettings);
            } else {
                // Dynamic modal logic
                const dynamicHandler = client.modals.find(m => interaction.customId.startsWith(m.customId));
                if (dynamicHandler) {
                    await dynamicHandler.execute(interaction, guildSettings);
                }
            }

        // 4. Handle Select Menus (Todos os tipos)
        } else if (interaction.isAnySelectMenu()) {
            const handler = client.selects.get(interaction.customId);
            if (handler) {
                await handler.execute(interaction, guildSettings);
            } else {
                // Dynamic select logic
                const dynamicHandler = client.selects.find(s => interaction.customId.startsWith(s.customId));
                if (dynamicHandler) {
                    await dynamicHandler.execute(interaction, guildSettings);
                }
            }
        
        // 5. Handle Autocomplete
        } else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;
            
            try {
                await command.autocomplete(interaction, guildSettings);
            } catch (autocompleteError) {
                console.error(`Erro no autocomplete do comando ${interaction.commandName}:`, autocompleteError);
            }
        }

    } catch (error) {
        console.error(`❌ Erro CRÍTICO executando o handler de interação "${interaction.customId || interaction.commandName}":`, error);
        
        const errorMessage = '❌ Ocorreu um erro ao executar esta interação!';
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, flags: EPHEMERAL_FLAG });
            } else {
                await interaction.reply({ content: errorMessage, flags: EPHEMERAL_FLAG });
            }
        } catch (replyError) {
            console.error('Erro ao tentar responder ao usuário sobre o erro original:', replyError);
        }
    }
});

// ===================================================================
//  ⬆️  FIM DA CORREÇÃO DO ROTEADOR ⬆️
// ===================================================================

    // --- INÍCIO DA CORREÇÃO DO WEBHOOK E OAUTH2 UNIFICADOS ---
    const server = http.createServer(async (req, res) => {
        const reqUrl = url.parse(req.url, true);

        // 1. Rota de Callback do OAuth2 (CloudFlow)
        if (reqUrl.pathname === '/cloudflow/callback') {
            const code = reqUrl.query.code;
            const guildId = reqUrl.query.state; // O state carrega o ID da guilda

            if (!code) {
                console.log('[OAuth] Erro: Código não fornecido.');
                res.writeHead(400);
                return res.end('Erro: Codigo de autorizacao nao encontrado.');
            }

            try {
                // Troca do CODE pelo TOKEN usando AXIOS (Mais robusto que fetch em alguns ambientes)
                const params = new URLSearchParams();
                params.append('client_id', process.env.CLIENT_ID);
                params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
                params.append('grant_type', 'authorization_code');
                params.append('code', code);
                params.append('redirect_uri', process.env.REDIRECT_URI);
                params.append('scope', 'identify guilds.join'); // Escopo necessário

                console.log('[OAuth] Tentando trocar token...'); 
                
                const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                const tokenData = tokenResponse.data;
                console.log('[OAuth] Token recebido com sucesso.'); 

                // Buscar dados do usuário
                const userResponse = await axios.get('https://discord.com/api/users/@me', {
                    headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` }
                });
                const userData = userResponse.data;
                console.log(`[OAuth] Usuário autenticado: ${userData.username} (${userData.id})`); 

                // Criptografar tokens
                const encAccess = encrypt(tokenData.access_token);
                const encRefresh = encrypt(tokenData.refresh_token);
                
                if (!encAccess || !encRefresh) {
                    throw new Error('Falha na criptografia dos tokens.');
                }

                const expiresAt = Date.now() + (tokenData.expires_in * 1000);

                // Salvar no Banco de Dados
                console.log('[OAuth] Salvando no banco de dados...');
                
                await db.query(`
                    INSERT INTO cloudflow_verified_users 
                    (user_id, guild_id, access_token, refresh_token, expires_at, iv, scopes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (user_id, guild_id) 
                    DO UPDATE SET 
                        access_token = EXCLUDED.access_token,
                        refresh_token = EXCLUDED.refresh_token,
                        expires_at = EXCLUDED.expires_at,
                        iv = EXCLUDED.iv,
                        scopes = EXCLUDED.scopes;
                `, [
                    userData.id, 
                    guildId || 'global', 
                    encAccess.content, 
                    encRefresh.content, 
                    expiresAt, 
                    encAccess.iv, 
                    tokenData.scope
                ]);

                // Tentar dar o cargo na guilda (se houver guildId válido)
                if (guildId && guildId !== 'global') {
                    try {
                        const guild = await client.guilds.fetch(guildId).catch(() => null);
                        if (guild) {
                            const settings = await db.getGuildSettings(guildId);
                            if (settings && settings.cloudflow_verify_role_id) {
                                const member = await guild.members.fetch(userData.id).catch(() => null);
                                if (member) {
                                    await member.roles.add(settings.cloudflow_verify_role_id);
                                    console.log(`[OAuth] Cargo adicionado para ${userData.username} na guild ${guildId}`);
                                }
                            }
                        }
                    } catch (roleError) {
                        console.error(`[OAuth] Erro ao dar cargo:`, roleError.message);
                    }
                }

                // Resposta de Sucesso HTML
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Verificado</title></head>
                    <body style="background-color:#2b2d31; color:#fff; font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
                        <div style="text-align:center;">
                            <h1 style="color:#57F287; font-size:40px;">✅ Sucesso!</h1>
                            <p style="font-size:18px;">Sua conta <b>${userData.username}</b> foi verificada e vinculada com sucesso.</p>
                            <p style="color:#aaa;">Você pode fechar esta janela e voltar ao Discord.</p>
                        </div>
                    </body>
                    </html>
                `);

            } catch (error) {
                console.error('[CloudFlow OAuth] ❌ Erro Fatal:', error.message);
                if (error.response) console.error('Dados do Erro:', error.response.data); 
                
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>❌ Erro na Verificação</h1><p>Ocorreu um erro interno: ${error.message}</p><p>Verifique se o CLIENT_SECRET e REDIRECT_URI estão corretos no painel do bot.</p>`);
            }
            return;
        }

        // 2. Rota do Webhook Mercado Pago
        if (req.method === 'POST' && req.url === '/mp-webhook') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const notification = JSON.parse(body);
                    if (notification.type === 'payment') {
                        const paymentId = notification.data.id;
                        console.log(`[MP Webhook] Notificação de pagamento recebida: ${paymentId}`);
                        const cartResult = await db.query('SELECT * FROM store_carts WHERE payment_id = $1', [paymentId]);
                        const cart = cartResult.rows[0];
                        if (!cart) {
                            console.warn(`[MP Webhook] Pagamento ${paymentId} recebido, mas nenhum carrinho correspondente encontrado.`);
                            res.writeHead(200);
                            res.end('OK');
                            return;
                        }
                        if (cart.status === 'delivered') {
                            console.log(`[MP Webhook] Pagamento ${paymentId} já foi processado (status: ${cart.status}). Ignorando.`);
                            res.writeHead(200);
                            res.end('OK');
                            return;
                        }
                        const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [cart.guild_id])).rows[0];
                        if(!settings || !settings.store_mp_token) {
                            console.error(`[MP Webhook] Token do MP não encontrado para a guild ${cart.guild_id}`);
                            res.writeHead(500);
                            res.end('Internal Server Error');
                            return;
                        }
                        const mpClient = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
                        const payment = new Payment(mpClient);
                        const paymentInfo = await payment.get({ id: paymentId });

                        if (paymentInfo.status === 'approved') {
                            console.log(`[MP Webhook] Pagamento ${paymentId} para o carrinho ${cart.channel_id} foi APROVADO. Iniciando entrega...`);
                            
                            // Chama a função centralizada
                            await approvePurchase(client, cart.guild_id, cart.channel_id, null);

                            // Lógica de fechamento automático do carrinho
                            try {
                                const guild = await client.guilds.fetch(cart.guild_id);
                                const channel = await guild.channels.fetch(cart.channel_id);
                                
                                if (channel) {
                                    await channel.send('✅ Pagamento aprovado! Este carrinho será fechado e deletado em 10 segundos.');
                                    
                                    setTimeout(async () => {
                                        try {
                                            await channel.delete('Compra aprovada e finalizada (Mercado Pago).');
                                        } catch (e) {
                                            console.error(`[Store MP] Falha ao deletar o canal do carrinho ${cart.channel_id}:`, e);
                                        }
                                    }, 10000); // 10 segundos
                                }
                            } catch (e) {
                                console.error(`[Store MP] Falha ao encontrar canal ${cart.channel_id} para fechamento:`, e);
                            }
                        }
                    }
                    res.writeHead(200);
                    res.end('OK');
                } catch (error) {
                    console.error('[MP Webhook] Erro ao processar notificação:', error);
                    res.writeHead(500);
                    res.end('Internal Server Error');
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });
    // --- FIM DA CORREÇÃO DO WEBHOOK ---
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`[WEBHOOK] Servidor HTTP a escutar na porta ${PORT}`);
    });

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // 1. Chamada do Guardian AI para moderação (executa apenas uma vez)
    // --- CORREÇÃO: Guardian e Settings só funcionam em GUILDAS ---
    if (message.guild) {
        try {
            await processMessageForGuardian(message);
        } catch (err) {
            console.error('[Guardian AI] Erro não tratado:', err);
        }
    }

    // Inicializa settings vazio para evitar crash em DM
    let settings = {}; 
    if (message.guild) {
        settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};
    }
    // -------------------------------------------------------------

    // 2. Bloco ÚNICO para chat por menção
    const isMentioned = message.mentions.has(client.user) && !message.mentions.everyone;
    if (isMentioned && settings.guardian_ai_mention_chat_enabled && message.guild) {
        try {
            // Ignora se for apenas uma menção vazia
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;

            await message.channel.sendTyping();

            const recentMessages = await message.channel.messages.fetch({ limit: 7 });
            const chatHistory = recentMessages
                .filter(msg => !msg.author.bot || msg.author.id === client.user.id)
                .map(msg => ({
                    role: msg.author.id === client.user.id ? 'assistant' : 'user',
                    content: msg.content
                }))
                .reverse();

            const systemPrompt = `Você é um assistente amigável chamado "${client.user.username}". Responda ao usuário de forma completa, usando o histórico da conversa para manter o contexto.`;
            const aiResponse = await getAIResponse({
                guild: message.guild,
                user: message.author,
                featureName: "Chat por Menção",
                chatHistory: chatHistory,
                userMessage: userMessage,
                customPrompt: systemPrompt,
                useBaseKnowledge: true
            });

            if (aiResponse) {
                const chunks = splitMessage(aiResponse, { maxLength: 2000 });
                const firstChunk = chunks.shift();
                if (firstChunk) {
                    await message.reply(firstChunk);
                }
                for (const chunk of chunks) {
                    await message.channel.send(chunk);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            // Encerra o processamento aqui para não executar outras lógicas de mensagem
            return; 
        } catch (error) {
            console.error('[Mention Chat] Erro ao processar menção com IA:', error);
        }
    }
 
    // --- Início do Bloco do Arquiteto & Consultor de Servidor ---
    if (message.guild && (message.channel.name.startsWith('arquiteto-') || message.channel.name.startsWith('consultor-')) && message.channel.topic === message.author.id) {
        try {
            const sessionResult = await db.query('SELECT * FROM architect_sessions WHERE channel_id = $1 AND (status = $2 OR status = $3)', [message.channel.id, 'active', 'pending_confirmation']);
            if (sessionResult.rows.length === 0) return;
            
            if(sessionResult.rows[0].status === 'pending_confirmation') {
                return message.reply("Por favor, use os botões da mensagem acima para Confirmar, Editar ou Cancelar o plano. Se desejar continuar a conversa, clique em 'Editar Plano'.");
            }

            await message.channel.sendTyping();

            const session = sessionResult.rows[0];
            const chatHistory = session.chat_history || [];
            let systemPrompt;
            
            const isConsultantMode = message.channel.name.startsWith('consultor-');

            if (isConsultantMode) {
                systemPrompt = `
                    Você é um "Consultor de Servidor" para o Discord, um especialista em otimização. Seu objetivo é **propor ações concretas e com estilo**.

                    **REGRAS:**
                    1.  **SEJA OBJETIVO:** Vá direto ao ponto.
                    2.  **FOCO NA AÇÃO:** O usuário descreverá uma necessidade (ex: "quero um sistema de tickets"). Sua resposta DEVE ser um plano de **ADIÇÃO** em um bloco de código JSON. Não converse, apenas forneça o JSON.
                    3.  **ESTÉTICA:** Ao criar os nomes, use **emojis temáticos e símbolos criativos** para um visual agradável (ex: "🎫 --- TICKETS --- 🎫").
                    4.  **PLANO PARCIAL:** O JSON deve conter APENAS os novos itens a serem criados.

                    **Formato do JSON (Obrigatório):**
                    - "roles": array de objetos com "name" e "permissions".
                    - "categories": array de objetos com "name" e "channels".
                    - Dentro de "channels", cada objeto DEVE ter: "name" (string), "type": ('text' ou 'voice'), e **"purpose"** ('chat', 'readonly', 'welcome').
                `;
            } else {
                systemPrompt = `
                    Você é um "Arquiteto de Servidor" para o Discord. Seu objetivo é criar um plano de servidor completo, funcional e **visualmente impressionante**.

                    **REGRAS:**
                    1.  **SEJA OBJETIVO:** Faça no máximo 2 perguntas para entender o tema do servidor.
                    2.  **AÇÃO IMEDIATA:** Após a resposta do usuário, sua próxima mensagem DEVE ser o plano completo do servidor em um bloco de código JSON. **Não continue a conversa. Proponha o plano imediatamente.**
                    3.  **ESTÉTICA HIERÁQUICA:**
                        - **Nomes de CATEGORIA:** DEVEM ser decorados com estilo (ex: "--- --→ 「🎮 JOGOS」 ←-- ---").
                        - **Nomes de CANAL:** DEVEM ser simples, usando apenas um emoji temático no início (ex: "💬 bate-papo").
                    4.  **PERMISSÕES SEGURAS:** O plano DEVE ter uma categoria de "Boas-Vindas" pública ('welcome') e as demais privadas. O cargo "Membro" pode ver, mas só pode ESCREVER em canais com 'purpose: chat'. Nos canais 'readonly', eles só podem ler.

                    **FORMATO JSON OBRIGATÓRIO (Exemplo):**
                    \`\`\`json
                    {
                      "roles": [{ "name": "Membro", "permissions": "Básicas" }, { "name": "Staff", "permissions": "Moderação" }],
                      "categories": [{
                        "name": "--- --→ 「👋 BEM-VINDO」 ←-- ---",
                        "channels": [
                          { "name": "✅ verificar", "type": "text", "purpose": "welcome" },
                          { "name": "📜 regras", "type": "text", "purpose": "readonly" }
                        ]
                      },{
                        "name": "--- --→ 「💬 GERAL」 ←-- ---",
                        "channels": [
                          { "name": "💬 bate-papo", "type": "text", "purpose": "chat" },
                          { "name": "📢 avisos", "type": "text", "purpose": "readonly" }
                        ]
                      }]
                    }
                    \`\`\`
                `;
            }

            const aiResponse = await getAIResponse({
                guild: message.guild, user: message.author, featureName: "Arquiteto de Servidor",
                chatHistory: chatHistory, userMessage: message.content, customPrompt: systemPrompt, useBaseKnowledge: false,
            });

            if (!aiResponse) return await message.channel.send("❌ A IA não conseguiu processar a sua mensagem. Tente novamente.");

            const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const jsonBlueprint = JSON.parse(jsonMatch[1]);
                
                await db.query("UPDATE architect_sessions SET blueprint = $1, status = 'pending_confirmation' WHERE channel_id = $2", [jsonBlueprint, message.channel.id]);

                const rolesText = (jsonBlueprint.roles && jsonBlueprint.roles.length > 0) ? jsonBlueprint.roles.map(r => `• ${r.name} (${r.permissions})`).join('\n') : 'Nenhum cargo novo.';
                const categoriesText = (jsonBlueprint.categories && jsonBlueprint.categories.length > 0) ? jsonBlueprint.categories.map(c => `📂 **${c.name}**\n   └─ Canais: ${c.channels.map(ch => `\`#${ch.name}\``).join(', ')}`).join('\n\n') : 'Nenhuma categoria nova.';
                
                const embed = {
                    title: isConsultantMode ? '📋 Plano de Adição Proposto' : '📋 Plano de Construção Proposto',
                    description: isConsultantMode ? 'Analisei seu pedido e sugiro **adicionar** o seguinte ao seu servidor. Nada será removido.' : 'Analisei seu pedido e preparei um plano completo para o seu novo servidor. O que acha?',
                    color: 3447003,
                    fields: [
                        { name: '👑 Cargos a Serem Criados', value: rolesText },
                        { name: '📂 Categorias e Canais a Serem Criados', value: categoriesText }
                    ]
                };

                const actionRow = {
                    type: 1,
                    components: [
                        { type: 2, style: 3, label: isConsultantMode ? "Confirmar e Adicionar" : "Confirmar e Construir", emoji: { name: "🚀" }, custom_id: isConsultantMode ? `architect_confirm_add_${message.channel.id}` : `architect_confirm_build_${message.channel.id}` },
                        { type: 2, style: 1, label: "Editar/Pedir Alteração", emoji: { name: "📝" }, custom_id: `architect_edit_plan_${message.channel.id}` },
                        { type: 2, style: 4, label: "Cancelar", emoji: { name: "❌" }, custom_id: 'architect_cancel_build' }
                    ]
                };

                await message.channel.send({ embeds: [embed], components: [actionRow] });

            } else {
                await message.channel.send(aiResponse);
                const newHistory = [...chatHistory, { role: 'user', content: message.content }, { role: 'assistant', content: aiResponse }];
                await db.query('UPDATE architect_sessions SET chat_history = $1 WHERE channel_id = $2', [JSON.stringify(newHistory), message.channel.id]);
            }

        } catch (error) {
            console.error("[Arquiteto/Consultor Conversa] Erro:", error);
            await message.channel.send("❌ Ocorreu um erro crítico. A IA pode estar indisponível ou o plano gerado é inválido.");
        }
        return;
    }
    // --- Fim do Bloco ---

    // --- Início do Bloco de Relay (Loja e Tickets) ---
    try {
        if (message.channel.type === ChannelType.DM) {
            const activeCart = (await db.query("SELECT * FROM store_carts WHERE user_id = $1 AND (status = 'open' OR status = 'payment') AND thread_id IS NOT NULL", [message.author.id])).rows[0];
            if (activeCart) {
                const guild = await client.guilds.fetch(activeCart.guild_id);
                const thread = await guild.channels.fetch(activeCart.thread_id).catch(() => null);
                if (thread) {
                    const relayEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Mensagem de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                        .setColor('#5865F2')
                        .setDescription(message.content || '*Nenhuma mensagem, possível anexo abaixo.*');
                    const files = message.attachments.map(att => att.url);
                    await thread.send({ embeds: [relayEmbed], files: files });
                    await message.react('✅').catch(()=>{});
                }
            }
        }
        else if (message.channel.isThread()) {
            const activeCart = (await db.query("SELECT * FROM store_carts WHERE thread_id = $1 AND claimed_by_staff_id = $2", [message.channel.id, message.author.id])).rows[0];
            if (activeCart) {
                const customer = await client.users.fetch(activeCart.user_id);
                const relayEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Resposta de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setColor('#E67E22')
                    .setDescription(message.content || '*Nenhuma mensagem, possível anexo abaixo.*');
                const files = message.attachments.map(att => att.url);
                await customer.send({ embeds: [relayEmbed], files: files });
                await message.react('✅').catch(()=>{});
            }
        }
    } catch(e) {
        console.error("[Store Relay] Erro ao retransmitir mensagem:", e);
    }

    try {
        if (message.channel.type === ChannelType.DM) {
            const activeTicket = (await db.query("SELECT * FROM tickets WHERE user_id = $1 AND is_dm_ticket = true AND status = 'open'", [message.author.id])).rows[0];
            if (activeTicket) {
                const guild = await client.guilds.fetch(activeTicket.guild_id);
                const thread = await guild.channels.fetch(activeTicket.thread_id).catch(() => null);
                if (thread) {
                    const relayEmbed = new EmbedBuilder()
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setColor('#7289DA')
                        .setDescription(message.content || '*Nenhuma mensagem, possível anexo abaixo.*');
                    
                    const files = message.attachments.map(att => att.url);
                    await thread.send({ embeds: [relayEmbed], files });
                    await message.react('✅').catch(() => {});
                }
            }
        } 
        else if (message.channel.isThread()) {
            const activeTicket = (await db.query("SELECT * FROM tickets WHERE thread_id = $1 AND is_dm_ticket = true AND status = 'open'", [message.channel.id])).rows[0];
            
            if (activeTicket && message.author.id !== activeTicket.user_id && !message.author.bot) {
                const ticketSettings = (await db.query('SELECT tickets_cargo_suporte FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                const isStaff = member && ticketSettings && member.roles.cache.has(ticketSettings.tickets_cargo_suporte);

                if (isStaff) {
                     const customer = await client.users.fetch(activeTicket.user_id).catch(() => null);
                     if (customer) {
                        const content = message.content ? `**${message.author.username} diz:**\n${message.content}` : undefined;
                        const files = message.attachments.map(att => att.url);
                        
                        await customer.send({ content, files });
                        await message.react('✅').catch(() => {});
                     }
                }
            }
        }
    } catch (error) {
        console.error("[Ticket Relay] Erro ao retransmitir mensagem:", error);
    }
    // --- Fim do Bloco de Relay ---

    if (!message.guild) return;

    // --- INÍCIO DA NOVA LÓGICA DO ASSISTENTE DE TICKET ---
    const ticketResult = await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id]);
    if (ticketResult.rows.length > 0) {
        const ticket = ticketResult.rows[0];

        // Lógica de auto-fechamento (sem alterações)
        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        // Verifica se o sistema de IA para tickets está ativo no servidor
        if (!settings.tickets_ai_assistant_enabled) return;

        // Palavras-chave para pausar a IA
        const stopKeywords = ['pare de responder', 'silencio ia', 'pausar ia', 'ia, pare', 'ia pare', 'stop answering'];
        const messageContent = message.content.toLowerCase();
        
        const member = await message.guild.members.fetch(message.author.id);
        const isStaff = member.roles.cache.has(settings.tickets_cargo_suporte);
        const isTicketOwner = message.author.id === ticket.user_id;

        // 1. Lógica para PAUSAR a IA
        if ((isStaff || isTicketOwner) && stopKeywords.some(keyword => messageContent.includes(keyword))) {
            await db.query("UPDATE tickets SET ai_assistant_status = 'paused' WHERE channel_id = $1", [message.channel.id]);
            await message.reply('🤖 O assistente de IA foi pausado. Para reativá-lo, basta me mencionar.');
            return;
        }

        // 2. Lógica de REATIVAÇÃO e RESPOSTA
        const botWasMentioned = message.mentions.has(client.user.id);

        if (botWasMentioned && ticket.ai_assistant_status === 'paused') {
            await db.query("UPDATE tickets SET ai_assistant_status = 'active' WHERE channel_id = $1", [message.channel.id]);
            await message.reply('🤖 O assistente de IA foi reativado e voltará a responder automaticamente.');
        }

        // 3. Condição para a IA responder
        // A IA responde se:
        //   - O status for 'active' E a mensagem for do dono do ticket
        //   - OU se o bot for mencionado diretamente (porquerquer um no ticket)
        const shouldReply = (ticket.ai_assistant_status === 'active' && isTicketOwner) || botWasMentioned;

        if (!shouldReply) return;

        const history = await message.channel.messages.fetch({ limit: 6 });
        const chatHistory = history.map(msg => ({
            role: msg.author.id === client.user.id ? 'assistant' : 'user',
            content: msg.content,
        })).filter(msg => msg.content).reverse();

        await message.channel.sendTyping();
        const useBaseKnowledge = settings.tickets_ai_use_base_knowledge !== false;
        
        // Remove a menção da mensagem do usuário para não confundir a IA
        const cleanUserMessage = message.content.replace(/<@!?\d+>/g, '').trim();

        const aiResponse = await getAIResponse({
            guild: message.guild,
            user: message.author,
            featureName: "Assistente de Ticket",
            chatHistory: chatHistory,
            userMessage: cleanUserMessage,
            customPrompt: settings.tickets_ai_assistant_prompt,
            useBaseKnowledge: useBaseKnowledge
        });

        if (aiResponse) {
            await message.reply(aiResponse);
        }
    }
    // --- FIM DA NOVA LÓGICA DO ASSISTENTE DE TICKET ---
});

client.on('voiceStateUpdate', (oldState, newState) => {
    voiceHubManager(oldState, newState, client);
});
client.login(process.env.DISCORD_TOKEN);