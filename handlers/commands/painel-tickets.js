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
        // DeferReply normal (visível só para quem usou)
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guild.id;

        try {
            await interaction.editReply('🕵️ **Iniciando auditoria profunda...** verificando cada canal individualmente na API do Discord.');

            // 1. BUSCA AMPLA NO BANCO
            // Pega tudo que NÃO esteja fechado (pega 'open', 'claimed', 'paused', etc.)
            const query = `
                SELECT * FROM tickets 
                WHERE guild_id = $1 AND status != 'closed' AND status != 'fechado'
                ORDER BY ticket_number DESC
            `;
            const result = await db.query(query, [guildId]);
            const dbTickets = result.rows;

            if (dbTickets.length === 0) {
                return interaction.editReply('✅ **Limpo!** Não existe nenhum registro de ticket aberto no banco de dados para este servidor.');
            }

            // 2. VERIFICAÇÃO "BRUTE FORCE" (Um por um)
            // Isso garante que não é cache. Se o canal não responder, ele não existe.
            const ticketsAnalisados = await Promise.all(dbTickets.map(async (t) => {
                let statusCanal = 'VIVO';
                
                if (t.is_dm_ticket) {
                    statusCanal = 'DM (Ignorar)'; // Tickets de DM não têm canal no server
                } else {
                    try {
                        // Tenta buscar o canal direto na API
                        await interaction.guild.channels.fetch(t.channel_id, { force: true });
                    } catch (e) {
                        // Se der erro (ex: Unknown Channel), confirmamos que é Fantasma
                        statusCanal = 'FANTASMA'; 
                    }
                }

                return { ...t, statusCanal };
            }));

            // Separa os grupos
            const fantasmas = ticketsAnalisados.filter(t => t.statusCanal === 'FANTASMA');
            const vivos = ticketsAnalisados.filter(t => t.statusCanal === 'VIVO');

            // --- MONTAGEM DO PAINEL ---
            const embed = new EmbedBuilder()
                .setTitle('💀 Painel de Controle de Fantasmas')
                .setColor(fantasmas.length > 0 ? 'Red' : 'Green')
                .setDescription(`Analisei **${dbTickets.length}** registros no banco de dados.\n\n🔴 **Fantasmas Detectados:** ${fantasmas.length}\n(Canais deletados mas constam como abertos)\n\n🟢 **Tickets Reais:** ${vivos.length}\n(Canais que existem e estão funcionando)`)
                .setFooter({ text: 'Se o usuário pagou e travou, verifique também o sistema de CARRINHOS.' });

            const components = [];

            // --- MENU 1: FANTASMAS (Prioridade) ---
            if (fantasmas.length > 0) {
                const menuFantasmas = new StringSelectMenuBuilder()
                    .setCustomId('admin_fix_ghost')
                    .setPlaceholder(`🗑️ LIMPAR ${fantasmas.length} FANTASMAS AGORA`);

                // Adiciona opções (Max 25)
                fantasmas.slice(0, 25).forEach(t => {
                    menuFantasmas.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`☠️ #${t.ticket_number} (BUGADO)`)
                            .setDescription(`Canal ID: ${t.channel_id} | Status DB: ${t.status}`)
                            .setValue(t.ticket_number.toString())
                    );
                });

                components.push(new ActionRowBuilder().addComponents(menuFantasmas));
                
                // Botão de Limpar Tudo
                const btnNuke = new ButtonBuilder()
                    .setCustomId('admin_nuke_all_ghosts')
                    .setLabel('💥 DESTRUIR TODOS OS FANTASMAS')
                    .setStyle(ButtonStyle.Danger);
                
                components.push(new ActionRowBuilder().addComponents(btnNuke));
            }

            // --- MENU 2: TICKETS REAIS (Caso precise fechar manual) ---
            if (vivos.length > 0) {
                const menuVivos = new StringSelectMenuBuilder()
                    .setCustomId('admin_close_real')
                    .setPlaceholder('📂 Gerenciar Tickets Reais (Ativos)');

                vivos.slice(0, 25).forEach(t => {
                    menuVivos.addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`🟢 #${t.ticket_number} - Status: ${t.status}`)
                            .setDescription(`Canal ID: ${t.channel_id}`)
                            .setValue(t.ticket_number.toString())
                    );
                });

                components.push(new ActionRowBuilder().addComponents(menuVivos));
            }

            // Se não tiver nada nos menus (ex: só tickets DM), avisa
            if (components.length === 0) {
                embed.setDescription(embed.data.description + "\n\n⚠️ Apenas tickets de DM ou lista vazia.");
            }

            const response = await interaction.editReply({ 
                content: null, 
                embeds: [embed], 
                components: components 
            });

            // --- COLETOR ---
            const collector = response.createMessageComponentCollector({ time: 300000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.deferUpdate();

                // 1. Limpar Fantasma Específico
                if (i.customId === 'admin_fix_ghost' || i.customId === 'admin_close_real') {
                    const ticketNum = i.values[0];
                    await i.deferUpdate();

                    // Fecha no banco
                    await db.query(`
                        UPDATE tickets SET status = 'closed', closed_at = NOW() 
                        WHERE ticket_number = $1 AND guild_id = $2
                    `, [ticketNum, guildId]);

                    // Tenta deletar canal se for "Real" e ainda existir
                    const ticket = ticketsAnalisados.find(t => t.ticket_number.toString() === ticketNum);
                    if (ticket && ticket.statusCanal === 'VIVO') {
                        try {
                            const ch = await interaction.guild.channels.fetch(ticket.channel_id);
                            if (ch) await ch.delete('Admin Force Close');
                        } catch (e) {}
                    }

                    await i.followUp({ content: `✅ Ticket **#${ticketNum}** foi fechado e removido do banco!`, ephemeral: true });
                }

                // 2. Limpar TODOS os Fantasmas
                if (i.customId === 'admin_nuke_all_ghosts') {
                    await i.deferUpdate();
                    const ids = fantasmas.map(t => t.ticket_number);
                    
                    if (ids.length > 0) {
                        await db.query(`
                            UPDATE tickets SET status = 'closed', closed_at = NOW() 
                            WHERE guild_id = $1 AND ticket_number = ANY($2::int[])
                        `, [guildId, ids]);
                    }

                    await i.editReply({ content: `✅ **LIMPEZA CONCLUÍDA!**\nTodos os ${ids.length} tickets bugados foram fechados. O cliente já pode abrir novos.`, components: [], embeds: [] });
                    collector.stop();
                }
            });

        } catch (error) {
            console.error('Erro Fatal Painel Tickets:', error);
            await interaction.editReply(`❌ **Erro Crítico:** ${error.message}`);
        }
    }
};