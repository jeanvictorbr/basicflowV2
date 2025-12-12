const db = require('../../database.js');
const { StringSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    customId: 'flow_buy_start_',
    async execute(interaction) {
        const itemId = interaction.customId.split('flow_buy_start_')[1];
        
        // 1. Validar Item e Saldo novamente (segurança)
        const itemRes = await db.query('SELECT * FROM flow_shop_items WHERE id = $1', [itemId]);
        const userRes = await db.query('SELECT balance FROM flow_users WHERE user_id = $1', [interaction.user.id]);
        
        const item = itemRes.rows[0];
        const balance = userRes.rows[0] ? userRes.rows[0].balance : 0;

        if (!item) return interaction.reply({ content: "Item não existe.", ephemeral: true });
        if (balance < item.price) return interaction.reply({ content: "💸 Saldo insuficiente.", ephemeral: true });

        // 2. Listar Guildas onde o usuário é Admin
        const adminGuilds = [];
        // Itera sobre o cache de guildas do bot
        for (const [id, guild] of interaction.client.guilds.cache) {
            try {
                const member = await guild.members.fetch(interaction.user.id).catch(() => null);
                if (member && member.permissions.has(PermissionFlagsBits.Administrator)) {
                    adminGuilds.push({ label: guild.name, value: guild.id });
                }
            } catch (e) {}
        }

        if (adminGuilds.length === 0) {
            return interaction.reply({ content: "❌ Você não é administrador em nenhum servidor que eu estou.", ephemeral: true });
        }

        // Limita a 25 opções (limite do Discord)
        const options = adminGuilds.slice(0, 25);

        const select = new StringSelectMenuBuilder()
            .setCustomId(`flow_buy_confirm_${itemId}`)
            .setPlaceholder('Selecione o servidor para ativar a feature')
            .addOptions(options);

        await interaction.reply({
            content: `📦 **Confirmar Compra: ${item.name}**\nPreço: \`${item.price} FC\`\nDuração: ${item.duration_days} dias\n\nSelecione onde ativar:`,
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    }
};