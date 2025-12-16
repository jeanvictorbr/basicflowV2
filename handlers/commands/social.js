const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { generateProfileCard } = require('../../utils/profileGenerator.js');

module.exports = {
    // 1. CONFIGURAÇÃO (Sem opção 'mensagem' pois agora é via Modal)
    data: new SlashCommandBuilder()
        .setName('social')
        .setDescription('Sistema social completo')
        .addSubcommand(sub => 
            sub.setName('perfil')
                .setDescription('Vê o cartão de perfil')
                .addUserOption(opt => opt.setName('usuario').setDescription('De quem?')))
        .addSubcommand(sub => 
            sub.setName('bio')
                .setDescription('Define sua bio')
                .addStringOption(opt => opt.setName('texto').setDescription('Sua bio').setRequired(true).setMaxLength(150)))
        .addSubcommand(sub => 
            sub.setName('elogiar')
                .setDescription('Abre um formulário para elogiar alguém')
                .addUserOption(opt => opt.setName('usuario').setDescription('Quem merece?').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // --- SUBCOMANDO: PERFIL ---
        if (subcommand === 'perfil') {
            await interaction.deferReply({ ephemeral: true });
            
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!targetMember) return interaction.editReply("❌ Usuário não encontrado.");

            try {
                const [pontoRes, socialRes, repLogsRes] = await Promise.all([
                    db.query('SELECT total_ms FROM ponto_leaderboard WHERE user_id = $1 AND guild_id = $2', [targetUser.id, interaction.guild.id]),
                    db.query('SELECT * FROM social_users WHERE user_id = $1', [targetUser.id]),
                    db.query('SELECT author_id, timestamp, message FROM social_rep_logs WHERE target_id = $1 ORDER BY timestamp DESC LIMIT 1', [targetUser.id])
                ]);

                // PROCESSA DADOS DO ÚLTIMO ELOGIO (COM APELIDO DA GUILD)
                let lastRepUserObj = null;
                if (repLogsRes.rows.length > 0) {
                    try {
                        const authorId = repLogsRes.rows[0].author_id;
                        // Tenta buscar MEMBRO da GUILD para pegar o Apelido
                        const authorMember = await interaction.guild.members.fetch(authorId).catch(() => null);
                        
                        let displayName = 'Desconhecido';
                        if (authorMember) {
                            displayName = authorMember.displayName; // Nome na Guild
                        } else {
                            // Se saiu da guild, tenta pegar user global
                            const authorUser = await interaction.client.users.fetch(authorId).catch(()=>null);
                            displayName = authorUser ? authorUser.username : 'Desconhecido';
                        }

                        lastRepUserObj = {
                            displayName: displayName, // Passamos o nome pronto
                            date: repLogsRes.rows[0].timestamp,
                            message: repLogsRes.rows[0].message
                        };
                    } catch (e) {}
                }

                const memberData = {
                    ponto: pontoRes.rows[0] || { total_ms: 0 },
                    social: socialRes.rows[0] || { reputation: 0, bio: 'Sem bio...', background_url: null },
                    joinedAt: targetMember.joinedAt,
                    highestRoleName: targetMember.roles.highest.name,
                    highestRoleColor: targetMember.roles.highest.hexColor,
                    guildIconUrl: interaction.guild.iconURL({ extension: 'png', size: 256 }),
                    roleCount: targetMember.roles.cache.size - 1,
                    lastRepUser: lastRepUserObj
                };

                const buffer = await generateProfileCard(targetUser, memberData);
                const attachment = new AttachmentBuilder(buffer, { name: 'social-card.png' });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('elogiar_btn').setLabel('Elogiar (+1 Rep)').setEmoji('💖').setStyle(ButtonStyle.Success).setDisabled(targetUser.id === interaction.user.id),
                    new ButtonBuilder().setCustomId('ver_elogios').setLabel('Histórico').setEmoji('📜').setStyle(ButtonStyle.Secondary)
                );

                const msg = await interaction.editReply({ files: [attachment], components: [row] });
                
                // COLETOR DE BOTÕES
                const collector = msg.createMessageComponentCollector({ time: 300000 });
                collector.on('collect', async i => {
                    
                     // --- BOTÃO ELOGIAR (ABRIR MODAL) ---
                     if (i.customId === 'elogiar_btn') {
                        if (targetUser.id === i.user.id) return i.reply({ content: "❌ Sem auto-elogio!", ephemeral: true });

                        // Para abrir modal, a interação NÃO PODE estar deferida/respondida.
                        // O 'i' aqui é fresco, então podemos chamar showModal direto.
                        const modal = new ModalBuilder()
                            .setCustomId(`social_elogiar_submit_${targetUser.id}`)
                            .setTitle(`Elogiar ${targetUser.username.substring(0, 15)}`);

                        const messageInput = new TextInputBuilder()
                            .setCustomId('mensagem_input')
                            .setLabel("Mensagem (Opcional)")
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder("Escreva algo bonito...")
                            .setRequired(false)
                            .setMaxLength(100);

                        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
                        await i.showModal(modal);
                     }
                     
                     // --- BOTÃO HISTÓRICO (CORRIGIDO) ---
                     if (i.customId === 'ver_elogios' || i.customId === 'voltar_perfil') {
                        if (i.customId === 'voltar_perfil') {
                            // Voltar para a imagem (reutiliza attachment se possível, senão teria que regenerar)
                            // Como editReply suporta reutilizar, tentamos passar o mesmo buffer
                            await i.update({ files: [attachment], embeds: [], components: [row] });
                        } else {
                            // Busca histórico
                            // Usamos i.deferUpdate() se a busca for demorada, mas i.update direto é melhor se for rápido
                            // Se seu banco for lento, considere i.deferUpdate() e depois i.editReply()
                            try {
                                const fullLogs = await db.query('SELECT author_id, timestamp, message FROM social_rep_logs WHERE target_id = $1 ORDER BY timestamp DESC LIMIT 50', [targetUser.id]);
                                await handlePagination(i, fullLogs.rows, targetUser, attachment, row);
                            } catch (err) {
                                console.error(err);
                                if (!i.replied) await i.reply({content: '❌ Erro ao buscar histórico.', ephemeral:true});
                            }
                        }
                    }
                });

            } catch (err) {
                console.error(err);
                interaction.editReply("❌ Erro ao gerar.");
            }
        }

        // --- SUBCOMANDO: BIO ---
        if (subcommand === 'bio') {
            const bioText = interaction.options.getString('texto');
            await db.query(`INSERT INTO social_users (user_id, bio) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET bio = $2`, [interaction.user.id, bioText]);
            return interaction.reply({ content: `✅ Bio salva!`, ephemeral: true });
        }

        // --- SUBCOMANDO: ELOGIAR (COMANDO DIRETO) ---
        if (subcommand === 'elogiar') {
            const targetUser = interaction.options.getUser('usuario');
            if (targetUser.id === interaction.user.id) return interaction.reply({ content: "❌ Você não pode se elogiar.", ephemeral: true });
            
            // Abre o MESMO modal do botão
            const modal = new ModalBuilder()
                .setCustomId(`social_elogiar_submit_${targetUser.id}`) 
                .setTitle(`Elogiar ${targetUser.username.substring(0, 15)}`);

            const messageInput = new TextInputBuilder()
                .setCustomId('mensagem_input')
                .setLabel("Mensagem (Opcional)")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder("Escreva algo bonito...")
                .setRequired(false)
                .setMaxLength(100);

            modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
            await interaction.showModal(modal);
        }
    }
};

// --- FUNÇÃO DE PAGINAÇÃO CORRIGIDA ---
async function handlePagination(interaction, logs, targetUser, originalAttachment, originalRow) {
    const ITEMS_PER_PAGE = 5;
    let page = 0;
    const maxPages = Math.ceil(logs.length / ITEMS_PER_PAGE) || 1;

    const generateEmbed = (currentPage) => {
        const start = currentPage * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const slicedLogs = logs.slice(start, end);

        const embed = new EmbedBuilder()
            .setColor('#ff6b81')
            .setTitle(`📜 Histórico de Elogios: ${targetUser.username}`)
            .setFooter({ text: `Página ${currentPage + 1}/${maxPages} • Total: ${logs.length}` });

        if (slicedLogs.length === 0) {
            embed.setDescription("*Nenhum elogio recebido ainda.*");
        } else {
            const description = slicedLogs.map(log => {
                const date = new Date(log.timestamp).toLocaleDateString('pt-BR');
                const msg = log.message ? `"${log.message}"` : '"Sem mensagem"';
                return `💖 De <@${log.author_id}> em \`${date}\`\n💬 ${msg}`;
            }).join('\n────────────────\n');
            embed.setDescription(description);
        }
        return embed;
    };

    const getButtons = (currPage) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('voltar_perfil').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️'),
            new ButtonBuilder().setCustomId('pag_prev').setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(currPage === 0),
            new ButtonBuilder().setCustomId('pag_next').setLabel('Próximo').setStyle(ButtonStyle.Primary).setDisabled(currPage >= maxPages - 1)
        );
    };

    // Atualiza a mensagem existente (não cria nova)
    const msg = await interaction.update({
        files: [], // Remove a imagem temporariamente
        embeds: [generateEmbed(page)],
        components: [getButtons(page)],
        fetchReply: true
    });

    const pagCollector = msg.createMessageComponentCollector({ time: 60000 });

    pagCollector.on('collect', async subI => {
        if (subI.user.id !== interaction.user.id) return subI.reply({ content: 'Use seu próprio comando!', ephemeral: true });

        if (subI.customId === 'pag_prev') {
            page--;
            await subI.update({ embeds: [generateEmbed(page)], components: [getButtons(page)] });
        } else if (subI.customId === 'pag_next') {
            page++;
            await subI.update({ embeds: [generateEmbed(page)], components: [getButtons(page)] });
        } else if (subI.customId === 'voltar_perfil') {
            pagCollector.stop();
            // O evento 'voltar_perfil' também será capturado pelo coletor principal (lá em cima)
            // que vai restaurar a imagem. Não precisamos fazer nada aqui além de parar este coletor.
        }
    });
}