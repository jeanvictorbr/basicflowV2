// handlers/modals/modal_suggestion_submit.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'modal_suggestion_submit',
    async execute(interaction) {
        
        // 1. Tentar pegar os campos com VÁRIOS nomes possíveis para evitar erro de "Field Not Found"
        // Isso resolve o problema de incompatibilidade de nomes entre o botão e este handler
        let title, description;
        try {
            title = interaction.fields.getTextInputValue('input_suggestion_title');
        } catch (e) {
            title = interaction.fields.getTextInputValue('suggestion_title'); // Fallback
        }

        try {
            description = interaction.fields.getTextInputValue('input_suggestion_description');
        } catch (e) {
             // Tenta pegar com outro nome comum se falhar
             try {
                 description = interaction.fields.getTextInputValue('suggestion_content');
             } catch (e2) {
                 description = interaction.fields.getTextInputValue('suggestion_description');
             }
        }

        // Se ainda assim falhar, aborta com log
        if (!title || !description) {
            console.error("Erro: Não foi possível encontrar os campos do modal. Verifique os Custom IDs no arquivo que abre o modal.");
            return interaction.reply({ content: '❌ Erro interno: Campos do formulário não encontrados.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // 2. Carregar configurações
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};
        
        if (!settings.suggestions_enabled || !settings.suggestions_channel || !settings.suggestions_staff_role) {
            return interaction.editReply({ content: '❌ O sistema de sugestões está desativado ou mal configurado. Contate um administrador.' });
        }

        const suggestionsChannel = await interaction.guild.channels.fetch(settings.suggestions_channel).catch(() => null);

        if (!suggestionsChannel) {
            return interaction.editReply({ content: '❌ O canal de sugestões configurado não foi encontrado.' });
        }

        try {
            // 3. Inserir no Banco
            const suggestionResult = await db.query(
                'INSERT INTO suggestions (guild_id, message_id, user_id, title, description, upvotes, downvotes) VALUES ($1, $2, $3, $4, $5, 1, 0) RETURNING id',
                [interaction.guild.id, 'temp', interaction.user.id, title, description]
            );
            const suggestionId = suggestionResult.rows[0].id;
            
            await db.query('INSERT INTO suggestion_votes (suggestion_id, user_id, vote_type) VALUES ($1, $2, $3)', [suggestionId, interaction.user.id, 'upvote']);
            
            // Cooldown
            await db.query(
                `INSERT INTO suggestion_cooldowns (guild_id, user_id, last_suggestion_at) VALUES ($1, $2, NOW()) 
                 ON CONFLICT (guild_id, user_id) DO UPDATE SET last_suggestion_at = NOW()`,
                [interaction.guild.id, interaction.user.id]
            );

            // 4. Montar o Embed
            const defaultThumbnail = 'https://media.discordapp.net/attachments/1310610658844475404/1426130582441824306/Logotipo_Banda_de_Rock_Vermelho_e_Preto__1_-removebg-preview.png?ex=68ea1b1b&is=68e8c99b&hm=74b0388976d8a953f5d1cef3b246cc5de3e477158646012154d4373f5da847c5&=&format=webp&quality=lossless';
            
            // --- CORREÇÃO SOLICITADA: Usar imagem configurada ou fallback padrão
            const vitrineImage = settings.suggestions_vitrine_image || "https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e9b5ca&is=68e8644a&hm=e884e0f49fe63d1c0cd2b6b0a2ab52245243c7c74064d8c8186383a6fc2c1d3a&=&format=webp&quality=lossless";

            const suggestionEmbed = new EmbedBuilder()
                .setColor('#F1C40F')
                .setAuthor({ name: `Sugestão enviada por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTitle(title)
                .setDescription(`\`\`\`\n${description}\n\`\`\``)
                .setThumbnail(defaultThumbnail)
                .addFields(
                    { name: 'ID da Sugestão', value: `\`#${suggestionId}\``, inline: true },
                    { name: 'Status', value: '🕒 Pendente', inline: true },
                    { name: 'Votação', value: '👍 `1`   |   👎 `0`\n`🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩`' }
                )
                .setTimestamp()
                .setImage(vitrineImage) // AQUI ESTÁ A MUDANÇA
                .setFooter({ text: 'Koda - Sugestões' });

            // Botões
            const voteButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`suggestion_upvote`).setLabel('1').setStyle(ButtonStyle.Success).setEmoji('👍'),
                new ButtonBuilder().setCustomId(`suggestion_downvote`).setLabel('0').setStyle(ButtonStyle.Danger).setEmoji('👎')
            );
            
            const staffButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`suggestion_approve`).setLabel('Aprovar').setStyle(ButtonStyle.Primary).setEmoji('✅'),
                new ButtonBuilder().setCustomId(`suggestion_consider`).setLabel('Em Análise').setStyle(ButtonStyle.Secondary).setEmoji('🤔'),
                new ButtonBuilder().setCustomId(`suggestion_deny`).setLabel('Negar').setStyle(ButtonStyle.Danger).setEmoji('❌')
            );

            const discussionButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('suggestion_create_thread').setLabel('Criar Discussão').setStyle(ButtonStyle.Secondary).setEmoji('💬')
            );
            
            const mentionContent = settings.suggestions_mention_everyone ? '@everyone' : '';
            const headerContent = '### Nova Sugestão!\n> Vote e ajude a comunidade a crescer!';

            // Enviar Mensagem
            const suggestionMessage = await suggestionsChannel.send({
                content: `${mentionContent} ${headerContent}`,
                embeds: [suggestionEmbed],
                components: [voteButtons, staffButtons, discussionButton]
            });

            // Atualizar Message ID no banco
            await db.query('UPDATE suggestions SET message_id = $1 WHERE id = $2', [suggestionMessage.id, suggestionId]);

            await interaction.editReply({ content: `✅ Sua sugestão foi enviada com sucesso no canal ${suggestionsChannel}!` });
        } catch (error) {
            console.error('[Suggestion Submit] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao enviar sua sugestão. Verifique os logs.' });
        }
    }
};