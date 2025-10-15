// Substitua o conteúdo em: handlers/commands/arquiteto.js
const generateArchitectMenu = require('../../ui/guildArchitect/mainMenu.js');
const hasFeature = require('../../utils/featureCheck.js'); // Adicione esta linha
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'arquiteto',
    async execute(interaction) {
        // --- LÓGICA DE VERIFICAÇÃO ADICIONADA ---
        if (!await hasFeature(interaction.guild.id, 'ARQUITETO')) {
            return interaction.reply({ 
                content: '🏗️ **Módulo Arquiteto**\n\nEsta é uma funcionalidade premium exclusiva. Com ela, a nossa IA pode construir ou otimizar o seu servidor em minutos.\n\nPara ativá-la, por favor, adquira e ative uma chave de produto específica para o Arquiteto.', 
                ephemeral: true 
            });
        }
        // --- FIM DA LÓGICA DE VERIFICAÇÃO ---

        await interaction.reply({
            components: generateArchitectMenu(),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};