// handlers/buttons/suggestion_create_thread.js
const { ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    customId: 'suggestion_create_thread',
    execute: async (interaction, client) => {
        try {
            const message = interaction.message;
            
            // Verifica se já existe um tópico na mensagem
            if (message.hasThread) {
                return interaction.reply({ 
                    content: '❌ Já existe uma discussão criada para esta sugestão.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            // Pega o título do embed para o nome do tópico
            const suggestionEmbed = message.embeds[0];
            const title = suggestionEmbed && suggestionEmbed.title ? suggestionEmbed.title : 'Sugestão';
            
            // Limpa o título para não quebrar o limite de caracteres ou ficar feio
            const cleanTitle = title.replace('Sugestão de ', '').slice(0, 50);

            // 1. Cria o Tópico PÚBLICO (Herda quem pode ver a categoria/canal)
            const thread = await message.startThread({
                name: `💬 Discussão: ${cleanTitle}`,
                autoArchiveDuration: 1440, // 24 horas sem atividade
                type: ChannelType.PublicThread, // PublicThread = Quem vê o canal, vê a thread
                reason: `Discussão iniciada por ${interaction.user.tag}`
            });

            // 2. Adiciona o autor da interação
            try {
                await thread.members.add(interaction.user.id);
            } catch (err) {
                console.log("Não foi possível adicionar o membro automaticamente (ele pode entrar manualmente).");
            }

            // 3. Responde com o link
            await interaction.reply({ 
                content: `✅ **Discussão Criada!**\n\nQualquer membro que possa ver este canal poderá entrar e comentar no tópico abaixo.\n🔗 [Clique aqui para ir à discussão](${thread.url})`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('Erro ao criar thread:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: '❌ Ocorreu um erro ao criar o tópico. Verifique se tenho permissão de "Criar Tópicos Públicos".', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
    }
};