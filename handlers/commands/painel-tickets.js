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
            // --- A CORREÇÃO MÁGICA ---
            // Força o bot a ir no Discord e baixar a lista atualizada de canais.
            // Isso remove canais deletados do cache antes da verificação.
            await interaction.editReply('🔄 Sincronizando canais com o Discord para detectar fantasmas...');
            await interaction.guild.channels.fetch().catch(() => null);

            // 1. Buscar TODOS os tickets "abertos" no banco
            const query = `
                SELECT * FROM tickets 
                WHERE guild_id = $1 AND LOWER(status) = 'open' 
                ORDER BY ticket_number DESC
            `;
            
            const result = await db.query(query, [guildId]);

            if (result.rows.length === 0) {
                return interaction.editReply('✅ **Banco de dados limpo!** Não há tickets abertos registrados.');
            }

            // 2. O FILTRO DE FANTASMAS (Atualizado)
            const ticketsBugados = result.rows.filter(ticket => {
                const channel = interaction.guild.channels.cache.get(ticket.channel_id);
                // Se não achou o canal OU se o canal tem a flag 'deleted', é um fantasma
                return !channel || channel.deleted; 
            });

            if (ticketsBugados.length === 0) {
                return interaction.editReply(`✨ **Nenhum erro encontrado.**\nAnalisei ${result.rows.length} tickets abertos e todos possuem canais válidos.`);
            }

            // Pegamos apenas os 25 primeiros para caber no menu
            const ticketsParaExibir = ticketsBugados.slice(0, 25);

            // 3. Menu de Seleção
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('admin_ghost_ticket_select')
                .setPlaceholder(`Selecione para remover (${ticketsBugados.length} fantasmas)`);

            ticketsParaExibir.forEach(row => {
                const member = interaction.guild.members.cache.get(row.user_id);
                const userName = member ? member.user.username : `User ${row.user_id}`;
                
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`🗑️ Fantasma #${row.ticket_number} - ${userName}`)
                        .setDescription(`Canal ID: ${row.channel_id} (DELETADO)`)
                        .setValue(row.ticket_number.toString())
                );
            });

            const rowMenu = new ActionRowBuilder().addComponents(selectMenu);

            // 4. Botão "Limpar Tudo"
            const btnLimparTodos = new ButtonBuilder()
                .setCustomId('admin_clean_all_ghosts')
                .setLabel(`♻️ Corrigir Todos (${ticketsBugados.length})`)
                .setStyle(ButtonStyle.Danger);

            const rowBtn = new ActionRowBuilder().addComponents(btnLimparTodos);

            const response = await interaction.editReply({
                content: `🚨 **ALERTA DE FANTASMAS**\nEncontrei **${ticketsBugados.length}** tickets que estão "Abertos" no banco, mas **o canal não existe mais no Discord**.\n\nIsso acontece quando deletam o canal manualmente.`,
                components: [rowMenu, rowBtn]
            });

            // 5. Coletor de Ações
            const collector = response.createMessageComponentCollector({ 
                time: 300000 
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Sai daqui.', ephemeral: true });

                // --- OPÇÃO 1: Limpar um por um ---
                if (i.isStringSelectMenu()) {
                    const ticketNum = i.values[0];
                    await i.deferUpdate();

                    await db.query(`
                        UPDATE tickets SET status = 'closed', closed_at = NOW() 
                        WHERE ticket_number = $1 AND guild_id = $2
                    `, [ticketNum, guildId]);

                    await i.followUp({ content: `✅ Ticket Fantasma **#${ticketNum}** corrigido!`, ephemeral: true });
                }

                // --- OPÇÃO 2: Limpar TODOS (Lógica Completa) ---
                if (i.isButton() && i.customId === 'admin_clean_all_ghosts') {
                    await i.deferUpdate();

                    // Pega todos os IDs da lista de bugados
                    const idsParaFechar = ticketsBugados.map(t => t.ticket_number);

                    if (idsParaFechar.length > 0) {
                        // Fecha todos de uma vez no SQL
                        await db.query(`
                            UPDATE tickets SET status = 'closed', closed_at = NOW() 
                            WHERE guild_id = $1 AND ticket_number = ANY($2::int[])
                        `, [guildId, idsParaFechar]);
                    }

                    await i.editReply({ 
                        content: `✅ **Limpeza Geral Concluída!**\nTodos os **${idsParaFechar.length}** tickets fantasmas foram fechados no banco de dados.`, 
                        components: [] 
                    });
                    collector.stop();
                }
            });

        } catch (error) {
            console.error('Erro no filtro de tickets:', error);
            await interaction.editReply('❌ Erro ao processar. Verifique o console.');
        }
    }
};