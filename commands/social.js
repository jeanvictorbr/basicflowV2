const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('social')
        .setDescription('Sistema de identidade, reputação e perfil.')
        .addSubcommand(sub => 
            sub.setName('perfil')
               .setDescription('Exibe o cartão de perfil natalino (Seu ou de outro usuário).')
               .addUserOption(opt => opt.setName('usuario').setDescription('Usuário alvo (Opcional)')))
        .addSubcommand(sub => 
            sub.setName('elogiar')
               .setDescription('Dê um ponto de reputação para alguém (1x a cada 24h).')
               .addUserOption(opt => opt.setName('usuario').setDescription('Quem merece o elogio?').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('bio')
               .setDescription('Defina a mensagem personalizada do seu perfil.')
               .addStringOption(opt => opt.setName('texto').setDescription('Sua biografia (Max 150 caracteres)').setRequired(true))),
    
    async execute(interaction) {
        // A lógica é roteada pelo index.js para handlers/commands/social.js
    },
};