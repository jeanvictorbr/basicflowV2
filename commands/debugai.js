// Crie em: commands/debugai.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { listAvailableModels } = require('../utils/aiAssistant.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debugai')
        .setDescription('Diagnostica a conexão com a API de IA da Google.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const { apiKeyExists, models, error } = await listAvailableModels();

        if (!apiKeyExists) {
            return interaction.editReply({
                content: '❌ **Erro Crítico:** A variável de ambiente `GEMINI_API_KEY` não foi encontrada ou não está a ser carregada. Verifique o seu ficheiro `.env`.'
            });
        }

        if (error) {
            return interaction.editReply({
                content: `❌ **Ocorreu um erro ao tentar comunicar com a API da Google:**\n\`\`\`${error}\`\`\``
            });
        }

        if (models.length === 0) {
            return interaction.editReply({
                content: '⚠️ **Conexão bem-sucedida, mas nenhum modelo encontrado!**\nIsto confirma que o problema está nas permissões do seu projeto Google Cloud. Certifique-se de que a **Vertex AI API** está ativada como instruído anteriormente.'
            });
        }

        const modelList = models
            .map(m => `- \`${m.name}\` (Suporta: \`${m.supportedGenerationMethods.join(', ')}\`)`)
            .join('\n');
        
        await interaction.editReply({
            content: `✅ **Diagnóstico da API de IA concluído!**\n\n**Chave de API:** Carregada com sucesso.\n**Modelos Disponíveis para a sua Chave:**\n${modelList}`
        });
    },
};