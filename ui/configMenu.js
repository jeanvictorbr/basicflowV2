// meu-bot/ui/configMenu.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// 1. O EMBED: Usado para agrupar e descrever as seções.
const configEmbed = new EmbedBuilder()
    .setColor('#ff0004') // A cor Accent que você definiu (16711684)
    .setTitle('⚙️ Hub de Configurações')
    .setDescription(
        `Gerencie todos os módulos do bot através dos botões abaixo.\n\n` +
        `**🏖️ Ausências**\nConfigure todo o sistema de ausências.\n\n` +
        `**📂 Registros**\nConfigure todo o sistema de registros.\n\n` +
        `**🚨 Tickets**\nConfigure todo o sistema de tickets.\n\n` +
        `**👔 Uniformes**\nConfigure todo o sistema de uniformes.\n\n` +
        `**⏰ Bate-Ponto**\nConfigure todo o sistema de bate-ponto.`
    );

// 2. OS BOTÕES: Agrupados em fileiras para interatividade.
// Eu peguei os custom_ids do seu código JS para mantermos a consistência.
const row1 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('config_open_absences') // ID legível
            .setLabel('Configurar Ausências')
            .setEmoji('🏖️')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('config_open_registers') // ID legível
            .setLabel('Configurar Registros')
            .setEmoji('📂')
            .setStyle(ButtonStyle.Success),
    );
    
const row2 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('config_open_tickets') // ID legível
            .setLabel('Configurar Tickets')
            .setEmoji('🚨')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('config_open_uniforms') // ID legível
            .setLabel('Configurar Uniformes')
            .setEmoji('👔')
            .setStyle(ButtonStyle.Success),
    );

const row3 = new ActionRowBuilder()
    .addComponents(
         new ButtonBuilder()
            .setCustomId('config_open_punch_clock') // ID legível
            .setLabel('Configurar Bate-Ponto')
            .setEmoji('⏰')
            .setStyle(ButtonStyle.Success),
    );
    
const row4 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('c9cdc4dc42484645e4952ae618c00eae')
            .setLabel('Novidades do Bot')
            .setEmoji('🎉')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('6a6167838bde470ac24446d015ed1f60')
            .setLabel('Ativar Key')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('eb5a88847a1246d8a13d034c9991c39d')
            .setLabel('Link Discord')
            .setEmoji('🥇')
            .setStyle(ButtonStyle.Secondary)
    );

// 3. EXPORTAÇÃO: Exportamos o embed e os componentes para o comando usar.
const configMenuEmbed = {
    embeds: [configEmbed],
    components: [row1, row2, row3, row4]
};

module.exports = {
    configMenuEmbed
};