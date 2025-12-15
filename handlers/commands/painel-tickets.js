const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');
const db = require('../../database.js'); 

module.exports = {
    data: { name: 'painel-tickets' },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guild.id;

        try {
            await interaction.editReply('🔄 **Auditando canais e banco de dados...** (Isso pode levar alguns segundos)');

            // 1. FORÇAR FETCH DA API (Ignora Cache Antigo)
            // Isso garante que o bot veja EXATAMENTE o que existe no Discord agora.
            const channels = await interaction.guild.channels.fetch(undefined, { force: true }).catch(() => new Map());
            
            // 2. BUSCAR NO BANCO
            const query = `
                SELECT * FROM tickets 
                WHERE guild_id = $1 AND LOWER(status) = 'open' 
                ORDER BY ticket_number DESC
            `;
            const result = await db.query(query, [guildId]);
            const dbTickets = result.rows;

            // 3. COMPARAR (Lógica de Detecção de Fantasmas)
            const ticketsFantasmas = dbTickets.filter(t => {
                // Se é ticket de DM, ignoramos (não tem canal de guilda)
                if (t.is_dm_ticket) return false;

                // Verifica se o canal existe na lista "fresca" que acabamos de baixar
                const channelExists = channels.has(t.channel_id);
                
                // Se NÃO existe na lista de canais, é fantasma!
                return !channelExists;
            });

            const totalTickets = dbTickets.length;
            const totalFantasmas = ticketsFantasmas.length;

            // --- EMBED DE DIAGNÓSTICO ---
            const embed = new EmbedBuilder()
                .setTitle('🔧 Painel de Auditoria de Tickets')
                .setColor(totalFantasmas > 0 ? 'Red' : 'Green')
                .setDescription(`Este painel compara o Banco de Dados com os Canais Reais do servidor.\n\n**Resumo do Diagnóstico:**`)
                .addFields(
                    { name: '📂 No Banco de Dados', value: `**${totalTickets}** tickets constam como abertos.`, inline: true },
                    { name: '👻 Fantasmas (Bugados)', value: `**${totalFantasmas}** canais deletados manualmente.`, inline: true },
                    { name: '📡 Canais no Servidor', value: `${channels.size} canais lidos agora.`, inline: true }
                )
                .setFooter({ text: 'Se o automático falhar, use "Listar Todos" para fechar manualmente.' });

            // --- BOTÕES ---
            const btnLimparFantasmas = new ButtonBuilder()
                .setCustomId('admin_clean_ghosts')
                .setLabel(`Limpar ${totalFantasmas} Fantasmas`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(totalFantasmas === 0);

            const btnVerTodos = new ButtonBuilder()
                .setCustomId('admin_view_all')
                .setLabel('📋 Listar Todos (Manual)')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(btnLimparFantasmas, btnVerTodos);

            const response = await interaction.editReply({ 
                content: null, 
                embeds: [embed], 
                components: [row] 
            });

            // --- COLETOR DE AÇÕES ---
            const collector = response.createMessageComponentCollector({ time: 300000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.deferUpdate();

                // === AÇÃO 1: LIMPAR FANTASMAS (Automático) ===
                if (i.customId === 'admin_clean_ghosts') {
                    await i.deferUpdate();
                    
                    const ids = ticketsFantasmas.map(t => t.ticket_number);
                    if (ids.length > 0) {
                        await db.query(`
                            UPDATE tickets SET status = 'closed', closed_at = NOW() 
                            WHERE guild_id = $1 AND ticket_number = ANY($2::int[])
                        `, [guildId, ids]);
                    }

                    await i.editReply({ 
                        content: `✅ **Sucesso!** ${ids.length} tickets fantasmas foram sincronizados e fechados.`,
                        embeds: [], 
                        components: [] 
                    });
                }

                // === AÇÃO 2: LISTAR TODOS (Manual - Select Menu) ===
                if (i.customId === 'admin_view_all') {
                    await i.deferUpdate();

                    const menu = new StringSelectMenuBuilder()
                        .setCustomId('admin_force_close_select')
                        .setPlaceholder('Selecione QUALQUER ticket para fechar...');

                    // Mostra os últimos 25 (limite do discord)
                    dbTickets.slice(0, 25).forEach(t => {
                        const exists = channels.has(t.channel_id);
                        const emoji = exists ? '🟢' : '🔴';
                        const status = exists ? 'Canal OK' : 'DELETADO';
                        
                        menu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`${emoji} #${t.ticket_number} (User: ${t.user_id})`)
                                .setDescription(`Canal: ${t.channel_id} | Status: ${status}`)
                                .setValue(t.ticket_number.toString())
                        );
                    });

                    const rowMenu = new ActionRowBuilder().addComponents(menu);

                    await i.editReply({
                        content: `**Modo Manual:** Aqui estão os tickets abertos no banco. Os marcados com 🔴 não têm canal e devem ser fechados.`,
                        components: [rowMenu],
                        embeds: []
                    });
                }

                // === AÇÃO 3: SELECIONOU NO MENU (Fechar Individual) ===
                if (i.customId === 'admin_force_close_select') {
                    const ticketNum = i.values[0];
                    await i.deferUpdate();

                    // Fecha no banco
                    await db.query(`
                        UPDATE tickets SET status = 'closed', closed_at = NOW() 
                        WHERE ticket_number = $1 AND guild_id = $2
                    `, [ticketNum, guildId]);

                    // Tenta apagar canal se existir
                    const ticketData = dbTickets.find(t => t.ticket_number.toString() === ticketNum);
                    if (ticketData) {
                        const ch = channels.get(ticketData.channel_id);
                        if (ch) await ch.delete('Painel Admin Force Close').catch(() => {});
                    }

                    await i.followUp({ content: `✅ Ticket **#${ticketNum}** encerrado manualmente!`, ephemeral: true });
                }
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro crítico ao auditar tickets.');
        }
    }
};