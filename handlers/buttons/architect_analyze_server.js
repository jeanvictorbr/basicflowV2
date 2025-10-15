// Crie em: handlers/buttons/architect_analyze_server.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'architect_analyze_server',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // Serializa a estrutura atual do servidor
        const serverStructure = {
            roles: interaction.guild.roles.cache.map(role => ({ id: role.id, name: role.name })),
            channels: interaction.guild.channels.cache
                .filter(c => !c.isThread())
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: ChannelType[channel.type],
                    parent: channel.parentId
                }))
        };
        const structureString = JSON.stringify(serverStructure, null, 2);

        const channelName = `consultor-${interaction.user.username.substring(0, 20)}`;
        
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName && c.topic === interaction.user.id);
        if (existingChannel) {
            return interaction.editReply(`Você já tem uma sessão de consultoria aberta em ${existingChannel}.`);
        }

        try {
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                topic: interaction.user.id,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ],
            });

            // Usamos a mesma tabela, pois o fluxo é similar
            await db.query(
                'INSERT INTO architect_sessions (channel_id, guild_id, user_id, chat_history) VALUES ($1, $2, $3, $4)',
                [channel.id, interaction.guild.id, interaction.user.id, JSON.stringify([])]
            );

            await channel.send(
                `Olá, ${interaction.user}! Sou seu **Consultor de Servidor**.\n\n` +
                `Analisei a estrutura atual do seu servidor (listada abaixo) e estou pronto para ajudar. Você pode me pedir para:\n` +
                `> • **Sugerir melhorias** na organização.\n` +
                `> • **Adicionar novos sistemas** (como tickets, sugestões, loja, etc.).\n` +
                `> • **Criar cargos** com permissões específicas.\n\n` +
                `O que você tem em mente para melhorar no seu servidor?\n\n` +
                `\`\`\`json\n${structureString.substring(0, 1500)}...\n\`\`\`` // Limita para não exceder o limite de caracteres
            );

            await interaction.editReply(`✅ Ótimo! Criei um canal de consultoria privado para nós: ${channel}. Vamos continuar a conversa lá.`);

        } catch (error) {
            console.error("[Arquiteto Analisar] Erro ao criar canal:", error);
            await interaction.editReply('❌ Ocorreu um erro ao criar seu canal de consultoria. Verifique se tenho permissão para "Gerenciar Canais".');
        }
    }
};