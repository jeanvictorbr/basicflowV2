// File: index.js
// VERSÃO DE PRODUÇÃO: CÓDIGO COMPLETO + ANTI-CRASH RAM + OTIMIZAÇÃO DE LOOPS
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
const { 
    Client, 
    Collection, 
    Events, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    ChannelType, 
    EmbedBuilder, 
    PermissionsBitField, 
    ActivityType, 
    Options,
    WebhookClient 
} = require('discord.js');
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

// --- SISTEMA DE AUDITORIA (WEBHOOK DE ERRO) ---
const errorWebhook = process.env.LOG_WEBHOOK_URL ? new WebhookClient({ url: process.env.LOG_WEBHOOK_URL }) : null;

async function logToWebhook(title, error, context = {}) {
    if (!errorWebhook) return;
    try {
        const errorStack = error.stack ? error.stack.substring(0, 1000) : (error.message || String(error));
        const embed = new EmbedBuilder()
            .setTitle(`🚨 ERRO CRÍTICO: ${title}`)
            .setColor('#FF0000')
            .addFields({ name: 'Mensagem', value: `\`\`\`${error.message || 'N/A'}\`\`\`` })
            .setDescription(`**Stack Trace:**\n\`\`\`js\n${errorStack}\n\`\`\``)
            .setTimestamp();
        
        if (context.guild) embed.addFields({ name: 'Guild', value: `${context.guild}`, inline: true });
        
        await errorWebhook.send({ embeds: [embed] });
    } catch (err) { console.error('Falha no Webhook Logger:', err); }
}

// --- FUNÇÃO SEGURA DE URL ---
function getSafeUrl(inputUrl, defaultUrl = null) {
    if (typeof inputUrl === 'string' && (inputUrl.startsWith('http://') || inputUrl.startsWith('https://'))) {
        return inputUrl;
    }
    return defaultUrl;
}

// --- FUNÇÃO SEGURA DE COR ---
function resolveSafeColor(colorInput) {
    const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (colorInput && hexRegex.test(colorInput)) {
        return colorInput.startsWith('#') ? colorInput : `#${colorInput}`;
    }
    return '#2ECC71'; 
}

// --- CRIPTOGRAFIA ---
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

// ==================================================================================
// 🚨 CONFIGURAÇÃO BLINDADA DE MEMÓRIA (CACHE LIMITS) 🚨
// ==================================================================================
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMembers
    ],
    // Aqui está o segredo para rodar em 345 servidores com 1.5GB RAM
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        // Guarda poucas mensagens na RAM (apenas para IA recente)
        MessageManager: 10, 
        // NÃO guarda reações (economia enorme de objetos)
        ReactionManager: 0,
        // Limita o cache de membros. O bot buscará na API se precisar.
        // Isso impede que 170k membros fiquem na RAM o tempo todo.
        GuildMemberManager: { 
            maxSize: 50, 
            keepOverLimit: (member) => member.id === client.user.id 
        },
        UserManager: 50,
        // Presença (Online/Offline) é o maior consumidor de banda e RAM. Desligado.
        PresenceManager: 0, 
        ThreadManager: { maxSize: 10, keepOverLimit: (thread) => !thread.archived },
    }),
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: { interval: 1800, lifetime: 900 }, // Limpa memória a cada 30 min
    },
});
// -------------------------------------------

// Variáveis Globais
client.globalOpenTickets = 0; 

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
//  HANDLERS COLLECTIONS
// ===================================================================
client.commandHandlers = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selects = new Collection();

const commandUsage = new Map();
const COMMAND_THRESHOLD = 15;
const COMMAND_TIMEFRAME = 60 * 1000;

// --- EVENTOS ---

client.on(Events.GuildMemberAdd, async (member) => {
    try {
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
        
        const safeThumbnail = getSafeUrl(config.thumbnail_url, member.user.displayAvatarURL());
        const safeImage = getSafeUrl(config.image_url, null);

        const welcomeEmbed = new EmbedBuilder()
            .setColor(config.color || '#2ECC71')
            .setTitle(finalTitle)
            .setDescription(finalDescription)
            .setImage(safeImage)
            .setThumbnail(isPremium ? safeThumbnail : member.user.displayAvatarURL())
            .setFooter({ text: finalFooter })
            .setTimestamp();
        try {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        } catch (error) {
            console.error(`[Welcome] Falha ao enviar mensagem de boas-vindas no servidor ${member.guild.name}:`, error);
            logToWebhook('Welcome Error', error, { guild: member.guild.name });
        }
    } catch (err) {
        console.error('Welcome Event Error', err);
    }
});


client.on(Events.GuildMemberRemove, async (member) => {
    try {
        const settingsResult = await db.query('SELECT goodbye_enabled, goodbye_channel_id, goodbye_message_text FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
        const settings = settingsResult.rows[0];
        
        if (!settings || !settings.goodbye_enabled || !settings.goodbye_channel_id) return;

        const goodbyeChannel = await member.guild.channels.fetch(settings.goodbye_channel_id).catch(() => null);
        if (!goodbyeChannel) {
            console.error(`[Goodbye] Canal de despedida ${settings.goodbye_channel_id} não encontrado no servidor ${member.guild.name}.`);
            return;
        }

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
    } catch (e) {}
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const rolesChanged = oldMember.roles.cache.size !== newMember.roles.cache.size ||
                          !oldMember.roles.cache.every((role) => newMember.roles.cache.has(role.id));

    if (rolesChanged) {
        try {
            await updateUserTag(newMember);
        } catch (error) {
            console.error(`[RoleTag] Falha ao atualizar a tag para ${newMember.user.tag}:`, error);
        }
    }
});

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
//  CARREGAMENTO DE HANDLERS
// ===================================================================
console.log('--- Carregando Handlers ---');
const handlersPath = path.join(__dirname, 'handlers');

// 1. Carregar Handlers de Comandos
try {
    const commandHandlersPath = path.join(handlersPath, 'commands');
    const commandHandlerFiles = fs.readdirSync(commandHandlersPath).filter(file => file.endsWith('.js'));
    for (const file of commandHandlerFiles) {
        try {
            const handler = require(path.join(commandHandlersPath, file));
            const commandName = file.split('.')[0];
            
            if (typeof handler === 'function') {
                client.commandHandlers.set(commandName, handler);
            } 
            else if (handler.execute && typeof handler.execute === 'function') {
                client.commandHandlers.set(commandName, handler.execute);
            } 
            else {
                console.warn(`[HANDLER] ⚠️ Handler de comando ${file} não é uma função válida ou não possui 'execute'.`);
            }
        } catch (error) {
            console.error(`[HANDLER] ❌ Erro ao carregar comando ${file}:`, error);
        }
    }
    console.log(`[HANDLER] ✅ ${client.commandHandlers.size} handlers de comando carregados.`);
} catch (error) {
    console.error('[HANDLER] ❌ Falha ao ler o diretório de handlers de comando:', error);
}

// 2. Carregar Handlers de Componentes
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
console.log('--- Handlers Carregados ---');


// ===================================================================
// 🚦 EVENTO READY - LÓGICA ANTI-CRASH E STATUS CACHE 🚦
// ===================================================================
client.once(Events.ClientReady, async () => {
    startPontoUpdateLoop(client);
    startGiveawayMonitor(client);
    startStatsMonitor(client);
    
    await db.synchronizeDatabase();
    try { startPurgeMonitor(client, db); } catch(e) {}

    await updateModuleStatusCache(client);
    await restorePontoSessions(client);
    try { await MusicOrchestrator.start(); } catch (e) { console.error('[Music] Erro:', e); }
    
    // Deploy Comandos
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        if (process.env.DEV_GUILD_ID) {
            await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID), { body: [...commandsToDeploy, ...devCommandsToDeploy] });
        } else {
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsToDeploy });
        }
    } catch (error) { console.error('[CMD] Deploy erro:', error); }
    
    console.log(`🚀 Bot online! Logado como ${client.user.tag}`);
    logToWebhook('Bot Iniciado', { message: 'Sistema online e otimizado (Staggered Mode + Cache Diet).' });

    // --- SISTEMA DE STATUS ROTATIVO COM CACHE ---
    // Variáveis de cache para evitar consultas pesadas repetitivas
    let statusCache = { members: 0, tickets: 0, pontos: 0 };
    let statusIndex = 0;

    // Função de Busca (Roda a cada 5 minutos)
    const fetchStatusData = async () => {
        try {
            // Conta Tickets Abertos
            const ticketRes = await db.query("SELECT count(*) FROM tickets WHERE status = 'open'");
            
            // Conta Sessões de Ponto (Tenta end_time, se falhar tenta saida)
            let pontoCount = 0;
            try {
                const pontoRes = await db.query("SELECT count(*) FROM ponto_sessions WHERE end_time IS NULL");
                pontoCount = parseInt(pontoRes.rows[0].count) || 0;
            } catch (errPonto) {
                 try {
                     const pontoResBr = await db.query("SELECT count(*) FROM ponto_sessions WHERE saida IS NULL");
                     pontoCount = parseInt(pontoResBr.rows[0].count) || 0;
                 } catch(e) {}
            }

            statusCache.tickets = parseInt(ticketRes.rows[0].count) || 0;
            statusCache.pontos = pontoCount;
            // Soma membros do cache (devido a limitação de RAM, pode não ser exato em tempo real, mas previne crash)
            statusCache.members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            
            client.globalOpenTickets = statusCache.tickets;
            
            // Log discreto para debug
            console.log(`[Status Cache] Tickets: ${statusCache.tickets} | Pontos: ${statusCache.pontos}`);
        } catch (e) { 
            console.error('[Status Fetch] Erro ao buscar dados:', e.message); 
        }
    };

    // Função Visual (Roda a cada 15 segundos - LEVE)
    const rotateVisualStatus = () => {
        const statuses = [
            { name: `👥 Atendendo ${statusCache.members.toLocaleString('pt-BR')} Usuários`, type: ActivityType.Playing },
            { name: `🎫 ${statusCache.tickets} Tickets Abertos`, type: ActivityType.Watching },
            { name: `⏰ ${statusCache.pontos} Pontos Abertos`, type: ActivityType.Competing }
        ];

        client.user.setPresence({
            activities: [statuses[statusIndex]],
            status: 'online'
        });
        statusIndex = (statusIndex + 1) % statuses.length;
    };

    // --- INICIALIZAÇÃO "FILA INDIANA" (Staggering) ---
    // Inicia status
    await fetchStatusData();
    setInterval(fetchStatusData, 5 * 60 * 1000);
    setInterval(rotateVisualStatus, 15 * 1000);

    // 1. Chaves (10s delay)
    setTimeout(() => {
        syncUsedKeys(client);
        setInterval(() => syncUsedKeys(client), 60 * 1000);
    }, 10000);

    // 2. Punições (30s delay -> Intervalo 2 min)
    setTimeout(() => {
        checkExpiredPunishments(client);
        setInterval(() => checkExpiredPunishments(client), 2 * 60 * 1000); 
    }, 30000);

    // 3. Tickets (1 min delay -> Intervalo 10 min)
    setTimeout(() => {
        checkAndCloseInactiveTickets(client);
        setInterval(() => checkAndCloseInactiveTickets(client), 10 * 60 * 1000); 
    }, 60000);

    // 4. Cache/Tokens (1m30s delay -> Intervalo 15 min)
    setTimeout(() => {
        updateModuleStatusCache(client);
        checkTokenUsage(client);
        setInterval(() => updateModuleStatusCache(client), 15 * 60 * 1000);
        setInterval(() => checkTokenUsage(client), 15 * 60 * 1000);
    }, 90000);

    // 5. Cargos Loja (2 min delay -> Intervalo 1h)
    setTimeout(() => {
        checkExpiredRoles(client);
        setInterval(() => checkExpiredRoles(client), 60 * 60 * 1000);
    }, 120000);

    // 6. Carrinhos Inativos (3 min delay -> Intervalo 30 min)
    // Aumentado intervalo para evitar uso excessivo de RAM
    setTimeout(() => {
        try { checkInactiveCarts(client); } catch(e){}
        setInterval(() => { try { checkInactiveCarts(client); } catch(e){} }, 30 * 60 * 1000);
    }, 180000);

    // 7. Premium (4 min delay -> Intervalo 24h)
    setTimeout(() => {
        checkExpiringFeatures(client);
        setInterval(() => checkExpiringFeatures(client), 24 * 60 * 60 * 1000);
    }, 240000);
});

// ===================================================================
//  ROTEADOR DE INTERAÇÃO
// ===================================================================
client.on(Events.InteractionCreate, async interaction => {
    
    const guildSettings = await db.getGuildSettings(interaction.guildId);
    if (!guildSettings && interaction.guildId) {
        if (interaction.isChatInputCommand() && 
            interaction.commandName !== 'devpanel' && 
            interaction.commandName !== 'configurar') {
            
            return interaction.reply({ 
                content: '❌ Este servidor não parece estar registrado corretamente no meu banco de dados. Use `/configurar` (se for admin) ou contate o suporte.', 
                ephemeral: true 
            });
        }
    }

    // Manutenção
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
        // 1. Chat Input Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            const commandHandler = client.commandHandlers.get(interaction.commandName);
            
            if (!commandHandler) {
                console.error(`[HANDLER] ❌ Handler de comando não encontrado para: ${interaction.commandName}`);
                return interaction.reply({ content: '❌ Erro: O handler de execução para este comando não foi encontrado.', flags: EPHEMERAL_FLAG });
            }

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
            
            await commandHandler(interaction, guildSettings);

        // 2. Buttons
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

        // 3. Modals
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

        // 4. Select Menus
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
        
        // 5. Autocomplete
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
        logToWebhook('Interaction Error', error, { guild: interaction.guildId, user: interaction.user.tag });
        
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
//  SERVER HTTP & OAUTH2 & WEBHOOKS
// ===================================================================
const server = http.createServer(async (req, res) => {
    const reqUrl = url.parse(req.url, true);

    // 1. Rota de Callback do OAuth2 (CloudFlow)
    if (reqUrl.pathname === '/cloudflow/callback') {
        const code = reqUrl.query.code;
        const guildId = reqUrl.query.state;

        if (!code) {
            res.writeHead(400);
            return res.end('Erro: Codigo de autorizacao nao encontrado.');
        }

        try {
            const params = new URLSearchParams();
            params.append('client_id', process.env.CLIENT_ID);
            params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', process.env.REDIRECT_URI);
            params.append('scope', 'identify guilds.join');

            const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const tokenData = tokenResponse.data;
            
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: { authorization: `${tokenData.token_type} ${tokenData.access_token}` }
            });
            const userData = userResponse.data;

            const encAccess = encrypt(tokenData.access_token);
            const encRefresh = encrypt(tokenData.refresh_token);
            
            if (!encAccess || !encRefresh) throw new Error('Falha na criptografia dos tokens.');

            const expiresAt = Date.now() + (tokenData.expires_in * 1000);

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

            if (guildId && guildId !== 'global') {
                try {
                    const guild = await client.guilds.fetch(guildId).catch(() => null);
                    if (guild) {
                        const settings = await db.getGuildSettings(guildId);
                        if (settings && settings.cloudflow_verify_role_id) {
                            const member = await guild.members.fetch(userData.id).catch(() => null);
                            if (member) await member.roles.add(settings.cloudflow_verify_role_id);
                        }
                    }
                } catch (roleError) {
                    console.error(`[OAuth] Erro ao dar cargo:`, roleError.message);
                }
            }

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
            logToWebhook('OAuth Flow Error', error);
            
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>❌ Erro na Verificação</h1><p>Ocorreu um erro interno: ${error.message}</p>`);
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
                    const cartResult = await db.query('SELECT * FROM store_carts WHERE payment_id = $1', [paymentId]);
                    const cart = cartResult.rows[0];
                    if (!cart) {
                        res.writeHead(200); return res.end('OK');
                    }
                    if (cart.status === 'delivered') {
                        res.writeHead(200); return res.end('OK');
                    }
                    
                    const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [cart.guild_id])).rows[0];
                    if(!settings || !settings.store_mp_token) {
                        res.writeHead(500); return res.end('Internal Server Error');
                    }
                    
                    const mpClient = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
                    const payment = new Payment(mpClient);
                    const paymentInfo = await payment.get({ id: paymentId });

                    if (paymentInfo.status === 'approved') {
                        console.log(`[MP Webhook] Pagamento ${paymentId} aprovado. Entregando...`);
                        await approvePurchase(client, cart.guild_id, cart.channel_id, null);

                        try {
                            const guild = await client.guilds.fetch(cart.guild_id);
                            const channel = await guild.channels.fetch(cart.channel_id);
                            
                            if (channel) {
                                await channel.send('✅ Pagamento aprovado! Este carrinho será fechado e deletado em 10 segundos.');
                                setTimeout(async () => {
                                    try { await channel.delete('Compra aprovada (Mercado Pago).'); } catch (e) {}
                                }, 10000);
                            }
                        } catch (e) {
                            console.error(`[Store MP] Falha ao fechar canal ${cart.channel_id}:`, e);
                        }
                    }
                }
                res.writeHead(200);
                res.end('OK');
            } catch (error) {
                console.error('[MP Webhook] Erro:', error);
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[WEBHOOK] Servidor HTTP a escutar na porta ${PORT}`);
});

// ===================================================================
//  MESSAGE CREATE HANDLER (GUARDIAN / IA / ARQUITETO / RELAY)
// ===================================================================
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // 1. Guardian AI (Moderação Automática)
    if (message.guild) {
        try {
            await processMessageForGuardian(message);
        } catch (err) {
            console.error('[Guardian AI] Erro não tratado:', err);
        }
    }

    let settings = {}; 
    if (message.guild) {
        settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};
    }

    // 2. Chat por Menção (IA)
    const isMentioned = message.mentions.has(client.user) && !message.mentions.everyone;
    if (isMentioned && settings.guardian_ai_mention_chat_enabled && message.guild) {
        try {
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;

            await message.channel.sendTyping();
            const aiResponse = await getAIResponse({
                guild: message.guild,
                user: message.author,
                featureName: "Chat por Menção",
                chatHistory: [],
                userMessage: userMessage,
                useBaseKnowledge: true
            });

            if (aiResponse) {
                const chunks = splitMessage(aiResponse, { maxLength: 2000 });
                for (const chunk of chunks) {
                    await message.channel.send(chunk);
                }
            }
            return; 
        } catch (error) {
            console.error('[Mention Chat] Erro:', error);
        }
    }
 
    // 3. Arquiteto & Consultor de Servidor
    if (message.guild && (message.channel.name.startsWith('arquiteto-') || message.channel.name.startsWith('consultor-')) && message.channel.topic === message.author.id) {
        try {
            const sessionResult = await db.query('SELECT * FROM architect_sessions WHERE channel_id = $1 AND (status = $2 OR status = $3)', [message.channel.id, 'active', 'pending_confirmation']);
            if (sessionResult.rows.length === 0) return;
            
            if(sessionResult.rows[0].status === 'pending_confirmation') {
                return message.reply("Por favor, use os botões da mensagem acima para Confirmar, Editar ou Cancelar o plano.");
            }

            await message.channel.sendTyping();
            const session = sessionResult.rows[0];
            const chatHistory = session.chat_history || [];
            let systemPrompt;
            const isConsultantMode = message.channel.name.startsWith('consultor-');

            if (isConsultantMode) {
                systemPrompt = `Você é um "Consultor de Servidor". Responda com um JSON de ADIÇÃO de canais/cargos.`;
            } else {
                systemPrompt = `Você é um "Arquiteto de Servidor". Responda com um JSON completo de estrutura de servidor.`;
            }

            const aiResponse = await getAIResponse({
                guild: message.guild,
                user: message.author,
                featureName: "Arquiteto de Servidor",
                chatHistory: chatHistory,
                userMessage: message.content,
                customPrompt: systemPrompt,
                useBaseKnowledge: false,
            });

            if (!aiResponse) return await message.channel.send("❌ Erro na IA.");

            const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const jsonBlueprint = JSON.parse(jsonMatch[1]);
                await db.query("UPDATE architect_sessions SET blueprint = $1, status = 'pending_confirmation' WHERE channel_id = $2", [jsonBlueprint, message.channel.id]);

                const rolesText = (jsonBlueprint.roles && jsonBlueprint.roles.length > 0) ? jsonBlueprint.roles.map(r => `• ${r.name} (${r.permissions})`).join('\n') : 'Nenhum cargo novo.';
                const categoriesText = (jsonBlueprint.categories && jsonBlueprint.categories.length > 0) ? jsonBlueprint.categories.map(c => `📂 **${c.name}**\n   └─ Canais: ${c.channels.map(ch => `\`#${ch.name}\``).join(', ')}`).join('\n\n') : 'Nenhuma categoria nova.';
                
                const embed = new EmbedBuilder()
                    .setTitle(isConsultantMode ? '📋 Plano de Adição Proposto' : '📋 Plano de Construção Proposto')
                    .setDescription('Analisei seu pedido. O que acha?')
                    .setColor('#3498DB')
                    .addFields(
                        { name: '👑 Cargos', value: rolesText.substring(0, 1024) },
                        { name: '📂 Canais', value: categoriesText.substring(0, 1024) }
                    );

                const actionRow = {
                    type: 1,
                    components: [
                        { type: 2, style: 3, label: "Confirmar", emoji: { name: "🚀" }, custom_id: isConsultantMode ? `architect_confirm_add_${message.channel.id}` : `architect_confirm_build_${message.channel.id}` },
                        { type: 2, style: 1, label: "Editar", emoji: { name: "📝" }, custom_id: `architect_edit_plan_${message.channel.id}` },
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
            console.error("[Arquiteto] Erro:", error);
            await message.channel.send("❌ Erro interno no Arquiteto.");
        }
        return;
    }

    // 4. Relay System (Loja e Tickets - DM <-> Thread)
    try {
        if (message.channel.type === ChannelType.DM) {
            // Check Store Carts
            const activeCart = (await db.query("SELECT * FROM store_carts WHERE user_id = $1 AND (status = 'open' OR status = 'payment') AND thread_id IS NOT NULL", [message.author.id])).rows[0];
            if (activeCart) {
                const guild = await client.guilds.fetch(activeCart.guild_id);
                const thread = await guild.channels.fetch(activeCart.thread_id).catch(() => null);
                if (thread) {
                    const relayEmbed = new EmbedBuilder()
                        .setAuthor({ name: `Mensagem de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                        .setColor('#5865F2')
                        .setDescription(message.content || '*Anexo*');
                    const files = message.attachments.map(att => att.url);
                    await thread.send({ embeds: [relayEmbed], files: files });
                    await message.react('✅').catch(()=>{});
                }
            }
            // Check Tickets
            const activeTicket = (await db.query("SELECT * FROM tickets WHERE user_id = $1 AND is_dm_ticket = true AND status = 'open'", [message.author.id])).rows[0];
            if (activeTicket) {
                const guild = await client.guilds.fetch(activeTicket.guild_id);
                const thread = await guild.channels.fetch(activeTicket.thread_id).catch(() => null);
                if (thread) {
                    const relayEmbed = new EmbedBuilder()
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setColor('#7289DA')
                        .setDescription(message.content || '*Anexo*');
                    const files = message.attachments.map(att => att.url);
                    await thread.send({ embeds: [relayEmbed], files });
                    await message.react('✅').catch(() => {});
                }
            }
        }
        else if (message.channel.isThread()) {
            // Check Store Carts (Staff Response)
            const activeCart = (await db.query("SELECT * FROM store_carts WHERE thread_id = $1 AND claimed_by_staff_id = $2", [message.channel.id, message.author.id])).rows[0];
            if (activeCart) {
                const customer = await client.users.fetch(activeCart.user_id);
                const relayEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Resposta de ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setColor('#E67E22')
                    .setDescription(message.content || '*Anexo*');
                const files = message.attachments.map(att => att.url);
                await customer.send({ embeds: [relayEmbed], files: files });
                await message.react('✅').catch(()=>{});
            }
            // Check Tickets (Staff Response)
             const activeTicket = (await db.query("SELECT * FROM tickets WHERE thread_id = $1 AND is_dm_ticket = true AND status = 'open'", [message.channel.id])).rows[0];
             if (activeTicket && message.author.id !== activeTicket.user_id && !message.author.bot) {
                const ticketSettings = (await db.query('SELECT tickets_cargo_suporte FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                
                if (member && ticketSettings && member.roles.cache.has(ticketSettings.tickets_cargo_suporte)) {
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
    } catch (e) {
        console.error("[Relay] Erro ao retransmitir mensagem:", e);
    }

    if (!message.guild) return;

    // 5. Assistente de Ticket IA (Auto Resposta no Ticket)
    const ticketResult = await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id]);
    if (ticketResult.rows.length > 0) {
        const ticket = ticketResult.rows[0];

        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        if (!settings.tickets_ai_assistant_enabled) return;

        const stopKeywords = ['pare de responder', 'silencio ia', 'pausar ia', 'ia, pare', 'ia pare', 'stop answering'];
        const messageContent = message.content.toLowerCase();
        
        const member = await message.guild.members.fetch(message.author.id);
        const isStaff = member.roles.cache.has(settings.tickets_cargo_suporte);
        const isTicketOwner = message.author.id === ticket.user_id;

        if ((isStaff || isTicketOwner) && stopKeywords.some(keyword => messageContent.includes(keyword))) {
            await db.query("UPDATE tickets SET ai_assistant_status = 'paused' WHERE channel_id = $1", [message.channel.id]);
            await message.reply('🤖 O assistente de IA foi pausado. Para reativá-lo, basta me mencionar.');
            return;
        }

        const botWasMentioned = message.mentions.has(client.user.id);

        if (botWasMentioned && ticket.ai_assistant_status === 'paused') {
            await db.query("UPDATE tickets SET ai_assistant_status = 'active' WHERE channel_id = $1", [message.channel.id]);
            await message.reply('🤖 O assistente de IA foi reativado.');
        }

        const shouldReply = (ticket.ai_assistant_status === 'active' && isTicketOwner) || botWasMentioned;

        if (shouldReply) {
            const history = await message.channel.messages.fetch({ limit: 6 });
            const chatHistory = history.map(msg => ({
                role: msg.author.id === client.user.id ? 'assistant' : 'user',
                content: msg.content,
            })).filter(msg => msg.content).reverse();

            await message.channel.sendTyping();
            const cleanUserMessage = message.content.replace(/<@!?\d+>/g, '').trim();

            const aiResponse = await getAIResponse({
                guild: message.guild,
                user: message.author,
                featureName: "Assistente de Ticket",
                chatHistory: chatHistory,
                userMessage: cleanUserMessage,
                customPrompt: settings.tickets_ai_assistant_prompt,
                useBaseKnowledge: settings.tickets_ai_use_base_knowledge !== false
            });

            if (aiResponse) {
                await message.reply(aiResponse);
            }
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    voiceHubManager(oldState, newState, client);
});

// --- ANTI-CRASH E LOGIN ---
process.on('uncaughtException', (error) => {
    console.error('🔥 EXCEÇÃO NÃO TRATADA:', error);
    logToWebhook('Uncaught Exception', error, { type: 'Fatal Process Error' });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 REJEIÇÃO NÃO TRATADA:', reason);
    const errorObj = reason instanceof Error ? reason : new Error(String(reason));
    logToWebhook('Unhandled Rejection', errorObj, { type: 'Promise Error' });
});

client.login(process.env.DISCORD_TOKEN);