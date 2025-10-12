// Substitua o conteúdo em: index.js
const fs = require('node:fs');
const { checkExpiringFeatures } = require('./utils/premiumExpiryMonitor.js');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ChannelType, EmbedBuilder } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js');
const { processMessageForGuardian } = require('./utils/guardianAI.js');
const { checkExpiredPunishments } = require('./utils/punishmentMonitor.js');
const { updateUserTag } = require('./utils/roleTagUpdater.js');
const { checkInactiveCarts } = require('./utils/storeInactivityMonitor.js');
const { checkExpiredRoles } = require('./utils/storeRoleMonitor.js');
require('dotenv').config();
const hasFeature = require('./utils/featureCheck.js');
const db = require('./database.js');
const http = require('http');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const { approvePurchase } = require('./utils/approvePurchase.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers] });

client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();
client.hangmanTimeouts = new Map();

const commandUsage = new Map();
const COMMAND_THRESHOLD = 15; // Ex: 15 usos
const COMMAND_TIMEFRAME = 60 * 1000; // Em 1 minuto (60 segundos)

// --- Evento de Entrada de Membro (Boas-Vindas) ---
client.on(Events.GuildMemberAdd, async (member) => {
    const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [member.guild.id]);
    const settings = settingsResult.rows[0];
    if (!settings || !settings.welcome_enabled || !settings.welcome_channel_id) return;

    // 1. Adicionar cargo automático
    if (settings.autorole_id) {
        try {
            const role = await member.guild.roles.fetch(settings.autorole_id);
            if (role) await member.roles.add(role);
        } catch (error) {
            console.error(`[Welcome] Falha ao adicionar autorole para ${member.user.tag}:`, error);
        }
    }

    // 2. Enviar mensagem de boas-vindas
    const welcomeChannel = await member.guild.channels.fetch(settings.welcome_channel_id).catch(() => null);
    if (!welcomeChannel) return;

    const config = settings.welcome_message_config || {};
    const isPremium = await hasFeature(member.guild.id, 'CUSTOM_VISUALS');

    // Função para substituir placeholders
    const replacePlaceholders = (text) => {
        if (!text) return '';
        return text
            .replace(/{user.mention}/g, `<@${member.id}>`)
            .replace(/{user.tag}/g, member.user.tag)
            .replace(/{server.name}/g, member.guild.name)
            .replace(/{member.count}/g, member.guild.memberCount.toString());
    };

    // **AQUI ESTÁ A CORREÇÃO PRINCIPAL**
    // Primeiro, substituímos as variáveis nos textos.
    const finalTitle = replacePlaceholders(config.title || '👋 Bem-vindo(a) ao {server.name}!');
    const finalDescription = replacePlaceholders(config.description || 'Estamos felizes em ter você aqui, {user.mention}! Esperamos que você se divirta e faça novas amizades.');
    const finalFooter = isPremium && config.footer_text ? replacePlaceholders(config.footer_text) : 'Junte-se à nossa comunidade!';

    // Depois, montamos a embed com os textos já corrigidos.
    const welcomeEmbed = new EmbedBuilder()
        .setColor(config.color || '#2ECC71')
        .setTitle(finalTitle)
        .setDescription(finalDescription)
        .setImage(config.image_url || null)
        .setThumbnail(isPremium && config.thumbnail_url ? config.thumbnail_url : member.user.displayAvatarURL())
        .setFooter({ text: finalFooter })
        .setTimestamp();

    try {
        await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
        console.error(`[Welcome] Falha ao enviar mensagem de boas-vindas no servidor ${member.guild.name}:`, error);
    }
});

// ===================================================================
// ==          COLE O NOVO CÓDIGO DO WEBHOOK AQUI                   ==
// ===================================================================
client.on(Events.GuildCreate, async guild => {
    if (!process.env.GUILD_ADD_WEBHOOK_URL) {
        console.log(`[GUILD JOIN] Bot adicionado ao servidor ${guild.name} (${guild.id}), mas o webhook de notificação não está configurado.`);
        return;
    }

    try {
        const owner = await guild.fetchOwner();

        const joinEmbed = new EmbedBuilder()
            .setColor('#2ECC71') // Verde
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
            username: 'BasicFlow Alertas',
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
// ===================================================================
// ==                  FIM DO NOVO CÓDIGO                           ==
// ===================================================================
client.on(Events.GuildDelete, async guild => {
    if (!process.env.GUILD_REMOVE_WEBHOOK_URL) {
        console.log(`[GUILD LEAVE] Bot removido do servidor ${guild.name} (${guild.id}), mas o webhook de notificação não está configurado.`);
        return;
    }

    try {
        // Calcula há quanto tempo o bot estava no servidor
        const joinedAtTimestamp = Math.floor(guild.joinedTimestamp / 1000);
        const timeInGuild = `<t:${joinedAtTimestamp}:R>`;

        const leaveEmbed = new EmbedBuilder()
            .setColor('#E74C3C') // Vermelho
            .setTitle('❌ Bot Removido de um Servidor!')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Servidor', value: `**${guild.name}**\n\`${guild.id}\``, inline: true },
                { name: 'Membros no momento da saída', value: `\`${guild.memberCount || 'N/A'}\``, inline: true },
                { name: 'Estava no servidor desde', value: timeInGuild, inline: false }
            )
            .setTimestamp();

        const payload = {
            username: 'BasicFlow Alertas',
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

// --- Carregamento de Comandos e Handlers ---
client.commands = new Collection();
const commandsToDeploy = [];
const devCommandsToDeploy = [];
const devOnlyCommands = ['devpanel', 'debugai', 'enviar'];

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

console.log('--- Carregando Handlers ---');
client.handlers = new Collection();
const handlersPath = path.join(__dirname, 'handlers');
const handlerTypes = ['buttons', 'modals', 'selects', 'commands'];
handlerTypes.forEach(handlerType => {
    const handlerDir = path.join(handlersPath, handlerType);
    if (fs.existsSync(handlerDir)) {
        const handlerFiles = fs.readdirSync(handlerDir).filter(file => file.endsWith('.js'));
        for (const file of handlerFiles) {
            try {
                const handler = require(path.join(handlerDir, file));
                if (handler.customId && handler.execute) {
                    client.handlers.set(handler.customId, handler.execute);
                }
            } catch (error) {
                console.error(`[HANDLER] ❌ Erro ao carregar ${file}:`, error);
            }
        }
    }
});
console.log('--- Handlers Carregados ---');

// --- Evento de Bot Pronto ---
client.once(Events.ClientReady, async () => {
    await db.synchronizeDatabase();
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
    setInterval(() => checkAndCloseInactiveTickets(client), 5 * 60 * 1000);
    setInterval(() => checkExpiredPunishments(client), 1 * 60 * 1000);
    setInterval(() => checkInactiveCarts(client), 10 * 60 * 1000);
    setInterval(() => checkExpiredRoles(client), 60 * 60 * 1000);
    setInterval(() => checkExpiringFeatures(client), 24 * 60 * 60 * 1000); // Executa uma vez a cada 24 horas
});

// --- Evento de Interações (COM VERIFICAÇÃO GLOBAL DE MANUTENÇÃO) ---
client.on(Events.InteractionCreate, async interaction => {
        // --- VERIFICAÇÃO DE MANUTENÇÃO GLOBAL ---
        const botStatus = (await db.query("SELECT bot_enabled, maintenance_message_global FROM bot_status WHERE status_key = 'main'")).rows[0];
        if (!botStatus?.bot_enabled && interaction.user.id !== process.env.DEV_USER_ID) {
            const defaultMsg = "O bot está em manutenção. Por favor, tente novamente mais tarde.";
            return interaction.reply({ content: botStatus.maintenance_message_global || defaultMsg, ephemeral: true }).catch(() => {});
        }
        // --- INÍCIO DO NOVO CÓDIGO DE MONITORIZAÇÃO DE SPAM ---
        if (interaction.isChatInputCommand() && process.env.SPAM_ALERT_WEBHOOK_URL) {
            const now = Date.now();
            const key = `${interaction.guildId}-${interaction.user.id}`;

            // Limpa registos antigos
            const userUsage = (commandUsage.get(key) || []).filter(timestamp => now - timestamp < COMMAND_TIMEFRAME);
            userUsage.push(now);
            commandUsage.set(key, userUsage);

            if (userUsage.length === COMMAND_THRESHOLD) { // Alerta exatamente ao atingir o limite
                const spamEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle('🚨 Alerta de Alto Tráfego de Comandos')
                    .setDescription(`O utilizador **${interaction.user.tag}** atingiu o limite de uso de comandos.`)
                    .addFields(
                        { name: 'Utilizador', value: `${interaction.user}\n\`${interaction.user.id}\``, inline: true },
                        { name: 'Servidor', value: `**${interaction.guild.name}**\n\`${interaction.guild.id}\``, inline: true },
                        { name: 'Comando', value: `\`/${interaction.commandName}\`` },
                        { name: 'Alerta', value: `\`${COMMAND_THRESHOLD}\` comandos em menos de \`${COMMAND_TIMEFRAME / 1000}\` segundos.` }
                    )
                    .setTimestamp();

                fetch(process.env.SPAM_ALERT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'BasicFlow Monitor',
                        avatar_url: client.user.displayAvatarURL(),
                        embeds: [spamEmbed]
                    }),
                }).catch(err => console.error("[WEBHOOK] Falha ao enviar alerta de spam:", err));
            }
        }
        // --- FIM DO NOVO CÓDIGO ---

        // --- VERIFICAÇÃO DE MANUTENÇÃO POR GUILDA ---
        if (interaction.guild) {
            const guildSettings = (await db.query("SELECT bot_enabled_in_guild, maintenance_message_guild FROM guild_settings WHERE guild_id = $1", [interaction.guild.id])).rows[0];
            if (guildSettings && guildSettings.bot_enabled_in_guild === false && interaction.user.id !== process.env.DEV_USER_ID) {
                const defaultMsg = "O bot está temporariamente em manutenção neste servidor. Agradecemos a compreensão.";
                return interaction.reply({ content: guildSettings.maintenance_message_guild || defaultMsg, ephemeral: true }).catch(() => {});
            }
        }

    let handler;
    let customId;

    try {
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
            customId = interaction.commandName;
            handler = client.handlers.get(customId) || client.commands.get(customId)?.execute;
        } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            customId = interaction.customId;
            handler = client.handlers.get(customId);
            if (!handler) {
                const dynamicHandlerId = Array.from(client.handlers.keys()).find(key => key.endsWith('_') && customId.startsWith(key));
                if (dynamicHandlerId) {
                    handler = client.handlers.get(dynamicHandlerId);
                }
            }
        }

        if (!handler) {
            console.warn(`[HANDLER] Nenhum handler encontrado para a interação "${customId}"`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Esta interação expirou ou não foi encontrada.', ephemeral: true }).catch(() => {});
            }
            return;
        }
        
        // Se a interação não for de um dev, mas a IA estiver desativada, bloqueia apenas handlers de IA
        if (interaction.user.id !== process.env.DEV_USER_ID) {
            const isAiCommand = customId.includes('_ai') || customId.includes('debugai');
            const aiStatus = (await db.query("SELECT ai_services_enabled, maintenance_message FROM bot_status WHERE status_key = 'main'")).rows[0];
            if (isAiCommand && !aiStatus?.ai_services_enabled) {
                const defaultMsg = "Os serviços de IA estão em manutenção. Tente novamente mais tarde.";
                return interaction.reply({ content: aiStatus.maintenance_message || defaultMsg, ephemeral: true }).catch(()=>{});
            }
        }

        await handler(interaction, client);

    } catch (error) {
        console.error(`❌ Erro CRÍTICO executando o handler de interação "${customId}":`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '🔴 Houve um erro interno ao processar sua solicitação. A equipe de desenvolvimento foi notificada.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.reply({ content: '🔴 Houve um erro interno ao processar sua solicitação. A equipe de desenvolvimento foi notificada.', ephemeral: true }).catch(console.error);
        }
    }

});

// --- SERVIDOR WEBHOOK MERCADO PAGO ---
const server = http.createServer(async (req, res) => {
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
                        await approvePurchase(client, cart.guild_id, cart.channel_id);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[WEBHOOK] Servidor HTTP a escutar na porta ${PORT}`);
});

// --- Evento de Novas Mensagens ---
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // --- LÓGICA DE RELAY ATUALIZADA ---
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

    if (!message.guild) return;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};
    
    if (message.content.includes(client.user.id) && settings.guardian_ai_mention_chat_enabled) {
        try {
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;
            
            await message.channel.sendTyping();
            const channelMessages = await message.channel.messages.fetch({ limit: 3 });
            
            // CORREÇÃO: Mapeia as mensagens para o formato correto e filtra as vazias.
            const chatHistory = channelMessages.map(msg => {
                const content = msg.content.replace(/<@!?\d+>/g, '').trim();
                if (!content) return null; // Retorna nulo para mensagens vazias
                return {
                    // AQUI ESTÁ A CORREÇÃO PRINCIPAL: 'model' virou 'assistant'
                    role: msg.author.id === client.user.id ? 'assistant' : 'user',
                    content: content
                };
            }).filter(Boolean).reverse(); // Filtra os nulos e inverte a ordem
            
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
                await message.reply(aiResponse);
            }
            return;

        } catch(err) {
            console.error('[Mention Chat AI] Erro ao responder menção:', err);
        }
    }

    try {
        await processMessageForGuardian(message);
    } catch (err) {
        console.error('[Guardian AI] Erro não tratado:', err);
    }

    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    if (ticket) {
        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        if (!settings.tickets_ai_assistant_enabled) return;

        const history = await message.channel.messages.fetch({ limit: 6 });
        let humanSupportHasReplied = false;
        for (const msg of history.values()) {
            if (msg.author.bot || msg.author.id === ticket.user_id) continue;
            const member = await message.guild.members.fetch(msg.author.id).catch(() => null);
            if (member && member.roles.cache.has(settings.tickets_cargo_suporte)) {
                humanSupportHasReplied = true;
                break;
            }
        }

        if (humanSupportHasReplied) return;
        
        const chatHistory = history.map(msg => ({
            role: msg.author.id === client.user.id ? 'assistant' : 'user',
            content: msg.content,
        })).filter(msg => msg.content).reverse();
        
        await message.channel.sendTyping();
        
        const useBaseKnowledge = settings.tickets_ai_use_base_knowledge !== false;
        const aiResponse = await getAIResponse({
            guild: message.guild,
            user: message.author,
            featureName: "Assistente de Ticket",
            chatHistory: chatHistory,
            userMessage: message.content,
            customPrompt: settings.tickets_ai_assistant_prompt,
            useBaseKnowledge: useBaseKnowledge
        });
        
        if (aiResponse) {
            await message.channel.send(aiResponse);
        }
    }
});

// --- Evento de Atualização de Membro ---
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const settings = (await db.query('SELECT roletags_enabled FROM guild_settings WHERE guild_id = $1', [newMember.guild.id])).rows[0];
    if (!settings || !settings.roletags_enabled) return;
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        await updateUserTag(newMember);
    }
});
process.on('uncaughtException', async (error, origin) => {
    console.error('CRITICAL ERROR:', error);

    if (!process.env.ERROR_WEBHOOK_URL) return;

    // Limita o stack para não estourar o limite de caracteres do Discord
    const stack = error.stack ? (error.stack.length > 3800 ? `${error.stack.slice(0, 3800)}...` : error.stack) : 'N/A';

    const errorEmbed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('🔥 ERRO CRÍTICO NO BOT 🔥')
        .addFields(
            { name: 'Origem do Erro', value: `\`${origin}\`` },
            { name: 'Mensagem', value: `\`\`\`${error.message}\`\`\`` },
            { name: 'Stack Trace', value: `\`\`\`js\n${stack}\`\`\`` }
        )
        .setTimestamp();

    const payload = {
        content: '<@SEU_USER_ID>', // Coloque seu ID de usuário aqui para ser mencionado!
        username: 'BasicFlow Monitor de Erros',
        avatar_url: client.user.displayAvatarURL(),
        embeds: [errorEmbed]
    };

    try {
        await fetch(process.env.ERROR_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (webhookError) {
        console.error('Falha ao enviar o webhook de erro:', webhookError);
    }
});

client.login(process.env.DISCORD_TOKEN);