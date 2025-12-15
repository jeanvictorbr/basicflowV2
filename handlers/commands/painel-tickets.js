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
            // 1. Buscar TODOS os tickets abertos desta guilda no banco
            // Não usamos LIMIT aqui porque precisamos baixar todos para conferir quais estão bugados
            const query = `
                SELECT * FROM tickets 
                WHERE guild_id = $1 AND status = 'open' 
                ORDER BY ticket_number DESC
            `;
            
            const result = await db.query(query, [guildId]);

            if (result.rows.length === 0) {
                return interaction.editReply('✅ **Tudo limpo!** Nenhum ticket aberto encontrado no banco.');
            }

            // 2. O FILTRO MÁGICO (Detecta Fantasmas)
            // Verificamos se o canal ID do banco existe na lista de canais do Discord
            const ticketsBugados = result.rows.filter(ticket => {
                const channel = interaction.guild.channels.cache.get(ticket.channel_id);
                // Se channel for 'undefined', significa que foi deletado, então É BUGADO.
                return !channel; 
            });

            if (ticketsBugados.length === 0) {
                return interaction.editReply('✨ **Nenhum bug encontrado.**\nTodos os tickets abertos no banco possuem canais válidos no servidor.');
            }

            // Pegamos apenas os 25 primeiros para caber no menu (limite do Discord)
            const ticketsParaExibir = ticketsBugados.slice(0, 25);

            // 3. Criar o Menu de Seleção
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('admin_ghost_ticket_select')
                .setPlaceholder(`Selecione para remover (${ticketsBugados.length} detectados)`);

            ticketsParaExibir.forEach(row => {
                // Tenta pegar o nome do usuário (pode ser null se ele saiu do server)
                const member = interaction.guild.members.cache.get(row.user_id);
                const userName = member ? member.user.username : `User saiu/ID: ${row.user_id}`;
                
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`🗑️ Fantasma #${row.ticket_number} - ${userName}`)
                        .setDescription(`Canal ID: ${row.channel_id} (INEXISTENTE)`)
                        .setValue(row.ticket_number.toString())
                );
            });

            const rowMenu = new ActionRowBuilder().addComponents(selectMenu);

            // 4. Botão "Limpar Tudo" (Salva muito tempo)
            const btnLimparTodos = new ButtonBuilder()
                .setCustomId('admin_clean_all_ghosts')
                .setLabel(`♻️ Corrigir Todos (${ticketsBugados.length})`)
                .setStyle(ButtonStyle.Danger);

            const rowBtn = new ActionRowBuilder().addComponents(btnLimparTodos);

            const response = await interaction.editReply({
                content: `🚨 **ALERTA DE INCONSISTÊNCIA**\nEncontrei **${ticketsBugados.length}** tickets que constam como "Abertos" no banco de dados, mas **o canal não existe mais**.\n\nIsso pode impedir usuários de abrirem novos tickets.`,
                components: [rowMenu, rowBtn]
            });

            // 5. Coletor de Ações
            const collector = response.createMessageComponentCollector({ 
                time: 300000 // 5 minutos
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Apenas para você.', ephemeral: true });

                // --- OPÇÃO 1: Limpar um por um via Menu ---
                if (i.isStringSelectMenu()) {
                    const ticketNum = i.values[0];
                    await i.deferUpdate();

                    // Fecha no banco
                    await db.query(`
                        UPDATE tickets SET status = 'closed', closed_at = NOW() 
                        WHERE ticket_number = $1 AND guild_id = $2
                    `, [ticketNum, guildId]);

                    await i.followUp({ content: `✅ Ticket Fantasma **#${ticketNum}** foi fechado no banco de dados com sucesso.`, ephemeral: true });
                }

                // --- OPÇÃO 2: Limpar TODOS de uma vez ---
                if (i.isButton() && i.customId === 'admin_clean_all_ghosts') {
                    await i.deferUpdate();

                    // Pega os IDs de todos os tickets bugados
                    const idsParaFechar = ticketsBugados.map(t => t.ticket_number);

                    if (idsParaFechar.length > 0) {
                        // Comando SQL poderoso para fechar vários de uma vez (ANY)
                        await db.query(`
                            UPDATE tickets SET status = 'closed', closed_at = NOW() 
                            WHERE guild_id = $1 AND ticket_number = ANY($2::int[])
                        `, [guildId, idsParaFechar]);
                    }

                    await i.editReply({ 
                        content: `✅ **Limpeza Concluída!**\nTodos os **${idsParaFechar.length}** tickets fantasmas foram sincronizados e fechados no banco de dados.`, 
                        components: [] 
                    });
                    collector.stop();
                }
            });

        } catch (error) {
            console.error('Erro no filtro de tickets:', error);
            await interaction.editReply('❌ Erro ao processar filtro.');
        }
    }
};