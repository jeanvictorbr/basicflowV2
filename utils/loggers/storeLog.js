/*
 * Caminho: utils/loggers/storeLog.js
 * Descrição: Arquivo unificado de logs da loja (Vendas + Auditoria)
 */
const db = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Função auxiliar para buscar o canal de log
async function getLogChannel(client, guildId, column_name) {
    try {
        const settings = await db.query(`SELECT ${column_name} FROM guild_settings WHERE guild_id = $1`, [guildId]);
        if (settings.rows.length === 0 || !settings.rows[0][column_name]) return null;

        const channelId = settings.rows[0][column_name];
        const channel = await client.channels.fetch(channelId).catch(() => null);
        
        if (!channel || !channel.isTextBased()) return null; 
        
        return channel;
    } catch (error) {
        console.error(`Erro ao buscar canal de log (${column_name}) para guild ${guildId}:`, error);
        return null;
    }
}

// =====================================================================
//                 LOGS DE AUDITORIA (ADMINISTRAÇÃO)
// =====================================================================

/**
 * Registra ações administrativas (Criar/Deletar/Editar produtos).
 * Usa o mesmo canal de logs da loja ('store_log_channel_id').
 */
async function logStoreAction(client, guildId, actionType, user, details) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    let color, title, emoji;

    switch (actionType) {
        case 'CREATE':
            color = '#2ECC71'; // Verde
            title = 'Item Criado';
            emoji = '✨';
            break;
        case 'DELETE':
            color = '#E74C3C'; // Vermelho
            title = 'Item Removido';
            emoji = '🗑️';
            break;
        case 'EDIT':
            color = '#F1C40F'; // Amarelo
            title = 'Item Editado';
            emoji = '✏️';
            break;
        case 'STOCK':
            color = '#3498DB'; // Azul
            title = 'Estoque Alterado';
            emoji = '📦';
            break;
        default:
            color = '#95A5A6';
            title = 'Log da Loja';
            emoji = '🛒';
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`${emoji} Auditoria: ${title}`)
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setTimestamp()
        .setFooter({ text: `ID do Staff: ${user.id}` });

    if (details.name) embed.addFields({ name: 'Nome do Item/Categoria', value: `\`${details.name}\``, inline: true });
    if (details.price) embed.addFields({ name: 'Preço', value: `R$ ${details.price}`, inline: true });
    if (details.changes) embed.addFields({ name: 'Alterações', value: details.changes });
    
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("[Store Log] Falha ao enviar log de auditoria:", err));
}

// =====================================================================
//                 LOGS DE TRANSAÇÃO (VENDAS)
// =====================================================================

// Log de Compra Aprovada (Simples console log, pois a lógica principal está em approvePurchase.js)
async function logPurchase(client, guildId, userId, cartChannelId, totalPrice, products, deliveredProducts, paymentMethod, staffId) {
    console.log(`[Store Log] Compra ${cartChannelId} aprovada para ${userId}.`);
}

// Log de Reembolso
async function logRefund(client, guildId, userId, cartChannelId, staffId, reason) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const user = await client.users.fetch(userId).catch(() => ({ tag: `ID: ${userId}` }));
    const staff = await client.users.fetch(staffId).catch(() => ({ tag: `ID: ${staffId}` }));

    const embed = new EmbedBuilder()
        .setTitle("COMPRA REEMBOLSADA")
        .setDescription(
            `**Usuário:** ${user.tag} (${userId})\n` +
            `**Carrinho:** \`#${cartChannelId}\`\n` +
            `**Staff:** ${staff.tag} (${staffId})\n` +
            `**Motivo:** ${reason}`
        )
        .setColor("Orange");
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("Falha ao enviar log de reembolso:", err));
}

// Log de Carrinho Criado
async function logCartCreation(client, guildId, userId, cartChannelId) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const user = await client.users.fetch(userId).catch(() => ({ tag: `ID: ${userId}` }));

    const embed = new EmbedBuilder()
        .setTitle("CARRINHO CRIADO")
        .setDescription(
            `**Usuário:** ${user.tag} (${userId})\n` +
            `**Carrinho (Channel ID):** \`#${cartChannelId}\``
        )
        .setColor("Blue");
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("Falha ao enviar log de criação de carrinho:", err));
}

// Log de Carrinho Finalizado (Aguardando Pagamento)
async function logCartFinalization(client, guildId, userId, cartChannelId, totalPrice, products) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const user = await client.users.fetch(userId).catch(() => ({ tag: `ID: ${userId}` }));
    const productList = products.map(p => `\`${p.quantity}x\` ${p.name}`).join('\n');

    const embed = new EmbedBuilder()
        .setTitle("CARRINHO FINALIZADO (AGUARDANDO PAGAMENTO)")
        .setDescription(
            `**Usuário:** ${user.tag} (${userId})\n` +
            `**Carrinho:** \`#${cartChannelId}\`\n` +
            `**Valor:** R$ ${totalPrice.toFixed(2)}\n` +
            `**Itens:**\n${productList}`
        )
        .setColor("Yellow");
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("Falha ao enviar log de finalização de carrinho:", err));
}

// Log de Carrinho Cancelado
async function logCartCancel(client, guildId, userId, cartChannelId, reason = 'Cancelado pelo usuário.') {
     const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const user = await client.users.fetch(userId).catch(() => ({ tag: `ID: ${userId}` }));

    const embed = new EmbedBuilder()
        .setTitle("CARRINHO CANCELADO")
        .setDescription(
            `**Usuário:** ${user.tag} (${userId})\n` +
            `**Carrinho:** \`#${cartChannelId}\`\n` +
            `**Motivo:** ${reason}`
        )
        .setColor("Red");
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("Falha ao enviar log de cancelamento de carrinho:", err));
}

// Log de Pagamento Manual Enviado
async function logManualPayment(client, guildId, userId, cartChannelId, totalPrice, products, receiptUrl) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const user = await client.users.fetch(userId).catch(() => ({ tag: `ID: ${userId}` }));
    const productList = products.map(p => `\`${p.quantity}x\` ${p.name}`).join('\n');

    const embed = new EmbedBuilder()
        .setTitle("PAGAMENTO MANUAL ENVIADO (AGUARDANDO APROVAÇÃO)")
        .setDescription(
            `**Usuário:** ${user.tag} (${userId})\n` +
            `**Carrinho:** \`#${cartChannelId}\`\n` +
            `**Valor:** R$ ${totalPrice.toFixed(2)}\n` +
            `**Itens:**\n${productList}\n\n` +
            `**Comprovante:** [Clique para ver](${receiptUrl})`
        )
        .setColor("Purple");
    
    const components = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`store_staff_approve_payment`).setLabel("Aprovar Pagamento").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`store_staff_deny_payment`).setLabel("Negar Pagamento").setStyle(ButtonStyle.Danger)
        )
    ];
    
    await logChannel.send({ embeds: [embed], components: components }).catch(err => console.error("Falha ao enviar log de pagamento manual:", err));
}

// Log de Erro de Estoque
async function logStockError(client, guildId, productName, productId, quantityNeeded, quantityAvailable) {
    const logChannel = await getLogChannel(client, guildId, 'store_log_channel_id');
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("FALHA NA ENTREGA - SEM ESTOQUE")
        .setDescription(
            `O sistema tentou entregar um produto, mas não há estoque disponível.\n\n` +
            `**Produto:** ${productName} (ID: ${productId})\n` +
            `**Quantidade Pedida:** \`${quantityNeeded}\`\n` +
            `**Quantidade Disponível:** \`${quantityAvailable}\`\n\n` +
            `A compra foi aprovada, mas este item não foi entregue. Adicione estoque e entregue manualmente.`
        )
        .setColor("Red");
    await logChannel.send({ embeds: [embed] }).catch(err => console.error("Falha ao enviar log de erro de estoque:", err));
}

module.exports = {
    logStoreAction, // Nova função de Auditoria
    logPurchase,
    logRefund,
    logCartCreation,
    logCartFinalization,
    logCartCancel,
    logManualPayment,
    logStockError
};