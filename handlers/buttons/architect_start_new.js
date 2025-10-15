// Substitua o conteúdo em: handlers/buttons/architect_start_new.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'architect_start_new',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channelName = `arquiteto-${interaction.user.username.substring(0, 20)}`;
        
        // Verifica se já existe um canal para este usuário
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName && c.topic === interaction.user.id);
        if (existingChannel) {
            return interaction.editReply(`Você já tem uma sessão de arquitetura aberta em ${existingChannel}.`);
        }

        try {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                topic: interaction.user.id, // Armazena o ID do usuário para referência
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ],
            });

            await db.query(
                'INSERT INTO architect_sessions (channel_id, guild_id, user_id, chat_history) VALUES ($1, $2, $3, $4)',
                [channel.id, interaction.guild.id, interaction.user.id, JSON.stringify([])]
            );

            await channel.send(
                `Olá, ${interaction.user}! Eu sou seu Arquiteto de Servidor pessoal. ` +
                `Descreva em detalhes como você quer seu servidor. Por exemplo:\n\n` +
                `*"Quero um servidor de comunidade para jogos. Preciso de categorias para Bate-Papo, Jogos (com um canal de voz para cada jogo famoso), e uma área de moderação. Os cargos seriam Membro, Moderador e Admin."*\n\n` +
                `Pode começar a digitar. Quando eu tiver informações suficientes, vou apresentar um plano para sua aprovação.`
            );

            await interaction.editReply(`✅ Ótimo! Criei um canal privado para nós: ${channel}. Vamos continuar a conversa lá.`);

        } catch (error) {
            console.error("[Arquiteto] Erro ao criar canal:", error);
            await interaction.editReply('❌ Ocorreu um erro ao criar seu canal de planejamento. Verifique se tenho permissão para "Gerenciar Canais".');
        }
    }
};