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
            // --- 1. BUSCAR NO BANCO (Com os nomes exatos do seu schema.js) ---
            // Colunas usadas: ticket_number, user_id, channel_id, last_message_at
            // Filtro: status = 'open' (conforme padrão do seu schema)
            const query = `
                SELECT * FROM tickets 
                WHERE guild_id = $1 AND status = 'open' 
                ORDER BY ticket_number DESC 
                LIMIT 25
            `;
            
            const result = await db.query(query, [guildId]);

            if (result.rows.length === 0) {
                return interaction.editReply('✅ **Nenhum ticket aberto encontrado neste servidor.**');
            }

            // --- 2. CRIAR MENU (Dropdown) ---
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('admin_ticket_select')
                .setPlaceholder('Selecione um ticket para gerenciar...');

            // Adiciona opções baseadas no resultado do DB
            result.rows.forEach(row => {
                // Tenta pegar o nome do user no cache do Discord
                const member = interaction.guild.members.cache.get(row.user_id);
                const userName = member ? member.user.username : `User ID: ${row.user_id}`;
                
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Ticket #${row.ticket_number} - ${userName}`)
                        .setDescription(`Canal ID: ${row.channel_id}`)
                        .setValue(row.ticket_number.toString()) // Usamos o ticket_number como valor
                );
            });

            const rowMenu = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                content: `📂 **Encontrei ${result.rows.length} tickets abertos.**\nSelecione abaixo para ver detalhes ou fechar.`,
                components: [rowMenu]
            });

            // --- 3. COLETOR (Ouvir a seleção do Admin) ---
            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.StringSelect, 
                time: 300000 // 5 minutos
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: '❌ Apenas quem usou o comando pode mexer aqui.', ephemeral: true });
                }

                const selectedTicketNum = i.values[0];
                
                // Encontrar os dados do ticket selecionado na lista que já puxamos
                const ticketData = result.rows.find(t => t.ticket_number.toString() === selectedTicketNum);

                if (!ticketData) return i.reply({ content: 'Erro: Ticket não encontrado na memória.', ephemeral: true });

                // Puxar infos adicionais
                const ticketOwner = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);
                const channel = interaction.guild.channels.cache.get(ticketData.channel_id);

                // Embed de Detalhes
                const embed = new EmbedBuilder()
                    .setTitle(`🎫 Gerenciando Ticket #${ticketData.ticket_number}`)
                    .setColor('Blue')
                    .addFields(
                        { 
                            name: '👤 Criado por', 
                            value: ticketOwner ? `${ticketOwner.user.tag} (\`${ticketOwner.id}\`)` : `Desconhecido (\`${ticketData.user_id}\`)`, 
                            inline: true 
                        },
                        { 
                            name: '📍 Canal', 
                            value: channel ? `<#${channel.id}>` : '❌ Canal não existe mais', 
                            inline: true 
                        },
                        { 
                            name: '🕒 Última Atividade', 
                            // O schema tem 'last_message_at', usamos ele
                            value: ticketData.last_message_at ? `<t:${Math.floor(new Date(ticketData.last_message_at).getTime() / 1000)}:R>` : 'N/A', 
                            inline: false 
                        }
                    )
                    .setFooter({ text: 'Selecione abaixo para fechar este ticket permanentemente.' });

                // Botões de Ação
                const btnFechar = new ButtonBuilder()
                    .setCustomId(`admin_close_${selectedTicketNum}`)
                    .setLabel('🔒 Fechar e Deletar Canal')
                    .setStyle(ButtonStyle.Danger);

                const btnLink = new ButtonBuilder()
                    .setLabel('Ir para o Canal')
                    .setStyle(ButtonStyle.Link)
                    .setURL(channel ? channel.url : 'https://discord.com')
                    .setDisabled(!channel);

                const rowBotoes = new ActionRowBuilder().addComponents(btnFechar, btnLink);

                // Atualiza a mensagem com os detalhes
                const msgDetalhes = await i.update({
                    content: null,
                    embeds: [embed],
                    components: [rowMenu, rowBotoes], 
                    fetchReply: true
                });

                // --- SUB-COLETOR PARA O BOTÃO FECHAR ---
                const btnCollector = msgDetalhes.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 60000
                });

                btnCollector.on('collect', async btnInt => {
                    if (btnInt.customId === `admin_close_${selectedTicketNum}`) {
                        await btnInt.deferUpdate();

                        // 1. Deletar canal no Discord (se existir)
                        if (channel) {
                            await channel.delete('Fechado via Painel Admin').catch(e => console.log('Erro ao deletar canal:', e.message));
                        }

                        // 2. Atualizar Banco de Dados (Schema: status='closed', closed_at=NOW())
                        // Usamos ticket_number no WHERE
                        await db.query(`
                            UPDATE tickets 
                            SET status = 'closed', closed_at = NOW() 
                            WHERE ticket_number = $1 AND guild_id = $2
                        `, [ticketData.ticket_number, guildId]);

                        await interaction.followUp({ content: `✅ Ticket **#${ticketData.ticket_number}** fechado com sucesso!`, ephemeral: true });
                        btnCollector.stop();
                    }
                });
            });

        } catch (error) {
            console.error('Erro no painel de tickets:', error);
            if (!interaction.replied) {
                await interaction.editReply('❌ Erro ao consultar banco de dados.');
            }
        }
    }
};