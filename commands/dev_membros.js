const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev_membros')
        .setDescription('[DEV] Gerencia o banco global de usuários OAuth2')
        .addStringOption(option => 
            option.setName('acao')
                .setDescription('Ação a realizar')
                .setRequired(true)
                .addChoices(
                    { name: 'Listar Todos (Global)', value: 'list_all' },
                    { name: 'Puxar Membro (ID)', value: 'pull_id' }
                ))
        .addStringOption(option => option.setName('id').setDescription('ID do usuário (para puxar)')),

    async execute(interaction) {
        // Verificação de segurança: Apenas você pode usar
        if (interaction.user.id !== 'SEU_ID_DE_DEV') { // Substitua pelo seu ID
            return interaction.reply({ content: "Apenas o desenvolvedor pode usar isso.", ephemeral: true });
        }

        const action = interaction.options.getString('acao');
        const authUrl = process.env.AUTH_SYSTEM_URL;

        await interaction.deferReply({ ephemeral: true });

        if (action === 'list_all') {
            try {
                const response = await axios.get(`${authUrl}/api/users`, {
                    params: { all: 'true', limit: 20 } // Traz os 20 ultimos globais
                });
                
                const users = response.data.users;
                const list = users.map(u => `• **${u.username}** (${u.id}) - Origem: ${u.origin_guild || 'N/A'}`).join('\n');

                const embed = new EmbedBuilder()
                    .setTitle('🌍 Global Auth Users (Top 20 Recentes)')
                    .setDescription(list || "Nenhum usuário.")
                    .setColor('#FF0000');

                await interaction.editReply({ embeds: [embed] });
            } catch (e) {
                await interaction.editReply(`Erro: ${e.message}`);
            }
        }

        if (action === 'pull_id') {
            const targetId = interaction.options.getString('id');
            if (!targetId) return interaction.editReply("Forneça o ID.");

            try {
                await axios.post(`${authUrl}/api/join/${targetId}/${interaction.guild.id}`);
                await interaction.editReply(`🚀 Tentativa de puxar ${targetId} enviada.`);
            } catch (e) {
                await interaction.editReply(`Erro ao puxar: ${e.message}`);
            }
        }
    }
};