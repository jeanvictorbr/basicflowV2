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
const { syncUsedKeys } = require('./utils/keyStockMonitor.js');
const { logInteraction } = require('./utils/analyticsUtils.js');
const MODULES = require('./config/modules.js');
const { updateModuleStatusCache } = require('./utils/moduleStatusCache.js');
const { splitMessage } = require('./utils/messageSplitter'); //
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
client.moduleStatusCache = new Map();

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

client.once(Events.ClientReady, async () => {
    await db.synchronizeDatabase();
    await updateModuleStatusCache(client);
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
    setInterval(() => checkExpiringFeatures(client), 24 * 60 * 60 * 1000);
    setInterval(() => syncUsedKeys(client), 60 * 1000);
    setInterval(() => updateModuleStatusCache(client), 15 * 60 * 1000);
});

client.on(Events.InteractionCreate, async interaction => {
    logInteraction(interaction);
    let handler;
    let customId;
    if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
        customId = interaction.commandName;
    } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
        customId = interaction.customId;
    }

    // --- CORREÇÃO FINAL DA LÓGICA DE FEATURE FLAG ---
    if (customId) { // Garante que temos um ID para verificar
        const targetModule = MODULES.find(m => m.check(customId));
        if (targetModule) {
            const moduleStatus = client.moduleStatusCache.get(targetModule.name);
            // Se o módulo está desativado E o utilizador NÃO é o dev, bloqueia a interação.
            if (moduleStatus && !moduleStatus.is_enabled && interaction.user.id !== process.env.DEV_USER_ID) {
                const maintenanceMessage = moduleStatus.maintenance_message || `O módulo **${targetModule.name}** está em manutenção. Tente novamente mais tarde.`;
                return interaction.reply({ content: `🔧 ${maintenanceMessage}`, ephemeral: true }).catch(() => {});
            }
        }
    }
    // --- FIM DA CORREÇÃO ---
    
    const botStatus = (await db.query("SELECT bot_enabled, maintenance_message_global FROM bot_status WHERE status_key = 'main'")).rows[0];
    if (!botStatus?.bot_enabled && interaction.user.id !== process.env.DEV_USER_ID) {
        const defaultMsg = "O bot está em manutenção. Por favor, tente novamente mais tarde.";
        return interaction.reply({ content: botStatus.maintenance_message_global || defaultMsg, ephemeral: true }).catch(() => {});
    }
    if (interaction.isChatInputCommand() && process.env.SPAM_ALERT_WEBHOOK_URL) {
        const now = Date.now();
        const key = `${interaction.guildId}-${interaction.user.id}`;
        const userUsage = (commandUsage.get(key) || []).filter(timestamp => now - timestamp < COMMAND_TIMEFRAME);
        userUsage.push(now);
        commandUsage.set(key, userUsage);
        if (userUsage.length === COMMAND_THRESHOLD) {
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
                body: JSON.stringify({ username: 'BasicFlow Monitor', avatar_url: client.user.displayAvatarURL(), embeds: [spamEmbed] }),
            }).catch(err => console.error("[WEBHOOK] Falha ao enviar alerta de spam:", err));
        }
    }
    if (interaction.guild) {
        const guildSettings = (await db.query("SELECT bot_enabled_in_guild, maintenance_message_guild FROM guild_settings WHERE guild_id = $1", [interaction.guild.id])).rows[0];
        if (guildSettings && guildSettings.bot_enabled_in_guild === false && interaction.user.id !== process.env.DEV_USER_ID) {
            const defaultMsg = "O bot está temporariamente em manutenção neste servidor. Agradecemos a compreensão.";
            return interaction.reply({ content: guildSettings.maintenance_message_guild || defaultMsg, ephemeral: true }).catch(() => {});
        }
    }
    try {
        if (customId) {
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
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    await processGuardian(message);

    const isMentioned = message.mentions.has(client.user);
    if (!isMentioned) return;
    
    const guildSettings = await db.query('SELECT guardian_ai_mention_chat_enabled FROM guild_settings WHERE guild_id = $1', [message.guild.id]);
    const mentionChatEnabled = guildSettings.rows[0]?.guardian_ai_mention_chat_enabled;

    if (!mentionChatEnabled) return;

    try {
        await message.channel.sendTyping();

        const recentMessages = await message.channel.messages.fetch({ limit: 10 });
        const chatHistory = recentMessages
            .filter(msg => !msg.author.bot || msg.author.id === client.user.id)
            .map(msg => ({
                role: msg.author.id === client.user.id ? 'assistant' : 'user',
                content: msg.content
            }))
            .reverse();

        const aiResponse = await getAIResponse({
            guild: message.guild,
            user: message.author,
            featureName: 'Guardian Mention Chat',
            chatHistory: chatHistory,
            useBaseKnowledge: true
        });

        if (aiResponse) {
            // Usa a nova função para dividir a resposta em pedaços
            const chunks = splitMessage(aiResponse, { maxLength: 2000 });
            
            // Envia o primeiro pedaço como uma resposta direta à mensagem do usuário
            const firstChunk = chunks.shift();
            if (firstChunk) {
                await message.reply(firstChunk);
            }

            // Envia os pedaços restantes como mensagens normais no canal
            for (const chunk of chunks) {
                await message.channel.send(chunk);
                // Pequeno delay para garantir que as mensagens cheguem na ordem correta
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    } catch (error) {
        console.error('[Mention Chat] Erro ao processar menção com IA:', error);
    }

// --- FIM DA CORREÇÃO ---


 
 // --- Início do Bloco do Arquiteto & Consultor de Servidor ---
    if ((message.channel.name.startsWith('arquiteto-') || message.channel.name.startsWith('consultor-')) && message.channel.topic === message.author.id) {
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
                // --- NOVO PROMPT PARA O MODO CONSULTOR (MAIS DIRETO) ---
                // --- PROMPT ATUALIZADO PARA O MODO CONSULTOR ---
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
                    - Dentro de "channels", cada objeto DEVE ter: "name" (string), "type" ('text' ou 'voice'), e **"purpose"** ('chat', 'readonly', 'welcome').
                `;
            } else {
                // --- PROMPT DO ARQUITETO (DIRETO E COM ESTILO) ---
                systemPrompt = `
Você é um "Arquiteto de Servidor" para o Discord. Seu objetivo é criar um plano de servidor completo, funcional e **visualmente impressionante**.

                    **REGRAS:**
                    1.  **SEJA OBJETIVO:** Faça no máximo 2 perguntas para entender o tema do servidor.
                    2.  **AÇÃO IMEDIATA:** Após a resposta do usuário, sua próxima mensagem DEVE ser o plano completo do servidor em um bloco de código JSON. **Não continue a conversa. Proponha o plano imediatamente.**
                    3.  **ESTÉTICA HIERÁRQUICA:**
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
                        { type: 2, style: 3, label: isConsultantMode ? "Confirmar e Adicionar" : "Confirmar e Construir", emoji: { name: "✅" }, custom_id: isConsultantMode ? `architect_confirm_add_${message.channel.id}` : `architect_confirm_build_${message.channel.id}` },
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
        // Lógica de Relay da Loja (DM do Usuário -> Thread da Staff)
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
        // Lógica de Relay da Loja (Thread da Staff -> DM do Usuário)
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

    // --- Bloco do Ticket DM (CORRIGIDO E MELHORADO) ---
    try {
        // Lógica de DM do Usuário -> Thread da Staff
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
        // Lógica da Thread da Staff -> DM do Usuário (COM MELHORIA)
        else if (message.channel.isThread()) {
            const activeTicket = (await db.query("SELECT * FROM tickets WHERE thread_id = $1 AND is_dm_ticket = true AND status = 'open'", [message.channel.id])).rows[0];
            
            // Verifica se a mensagem veio de um staff e não do cliente ou do próprio bot
            if (activeTicket && message.author.id !== activeTicket.user_id && !message.author.bot) {
                const settings = (await db.query('SELECT tickets_cargo_suporte FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
                const member = await message.guild.members.fetch(message.author.id).catch(() => null);
                const isStaff = member && settings && member.roles.cache.has(settings.tickets_cargo_suporte);

                // Só retransmite se for um staff falando
                if (isStaff) {
                     const customer = await client.users.fetch(activeTicket.user_id).catch(() => null);
                     if (customer) {
                        // Adiciona um prefixo para identificar quem está respondendo
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

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};
    
    // Lógica do Guardian AI para Chat por Menção
    if (message.content.includes(client.user.id) && settings.guardian_ai_mention_chat_enabled) {
        try {
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;
            await message.channel.sendTyping();
            const channelMessages = await message.channel.messages.fetch({ limit: 3 });
            const chatHistory = channelMessages.map(msg => {
                const content = msg.content.replace(/<@!?\d+>/g, '').trim();
                if (!content) return null;
                return {
                    role: msg.author.id === client.user.id ? 'assistant' : 'user',
                    content: content
                };
            }).filter(Boolean).reverse();
           
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
            return; // Encerra o processamento aqui para não executar outras lógicas
        } catch(err) {
            console.error('[Mention Chat AI] Erro ao responder menção:', err);
        }
    }

    // Lógica do Guardian AI para Moderação
    try {
        await processMessageForGuardian(message);
    } catch (err) {
        console.error('[Guardian AI] Erro não tratado:', err);
    }

    // Lógica para tickets de canal (Auto-fechamento e Assistente de IA)
    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    if (ticket) {
        // Cancela o fechamento automático se houver nova mensagem
        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        // Lógica do Assistente de IA para tickets
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

client.login(process.env.DISCORD_TOKEN);