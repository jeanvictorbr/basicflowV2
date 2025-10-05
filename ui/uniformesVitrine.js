// ui/uniformesVitrine.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = function generateUniformesVitrine(settings, uniforms) {
    const embed = new EmbedBuilder()
        .setColor(settings.uniformes_color || '#FFFFFF')
        .setTitle('Vitrine de Uniformes')
        .setDescription('Selecione um uniforme abaixo para visualizar os detalhes e pegá-lo.')
        .setThumbnail(settings.uniformes_thumbnail_url);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_uniforme_role')
        .setPlaceholder('Escolha um uniforme...');
    
    if (uniforms && uniforms.length > 0) {
        const options = uniforms.map(uni => ({
            label: uni.name,
            description: uni.description.substring(0, 100) || 'Clique para ver mais.',
            value: uni.role_id,
        }));
        selectMenu.addOptions(options);
    } else {
        selectMenu.addOptions([{ label: 'Nenhum uniforme configurado.', value: 'none', default: true }]).setDisabled(true);
    }

    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu)] };
};