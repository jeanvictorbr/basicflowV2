// ui/uniformesVitrine.js
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateUniformesVitrine(interaction, settings, allUniformes, selectedUniform = null) {
    const embed = new EmbedBuilder()
        .setColor(settings.uniformes_color || '#FFFFFF')
        .setTitle('Vestiário da Organização')
        .setThumbnail(settings.uniformes_thumbnail_url || interaction.guild.iconURL())
        .setDescription('Use o menu abaixo para escolher um uniforme. A imagem e o código do preset aparecerão aqui.');

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('uniform_vitrine_select')
        .setPlaceholder('Escolha um uniforme...');

    const components = [];

    if (allUniformes && allUniformes.length > 0) {
        const options = allUniformes.map(uni => ({
            label: uni.name,
            // CORREÇÃO DO BUG: Garante que a descrição nunca seja uma string vazia.
            description: uni.description?.substring(0, 100) || 'Clique para ver mais.',
            value: String(uni.id),
        }));
        selectMenu.addOptions(options);
        components.push(new ActionRowBuilder().addComponents(selectMenu));
    } else {
        selectMenu.addOptions([{ label: 'Nenhum uniforme configurado.', value: 'none', default: true }]).setDisabled(true);
        components.push(new ActionRowBuilder().addComponents(selectMenu));
    }

    if (selectedUniform) {
        embed.setImage(selectedUniform.image_url);
        embed.addFields({
            name: `Código do Preset: \`${selectedUniform.name}\``,
            value: `\`\`\`${selectedUniform.preset_code}\`\`\``
        });
        const copyButton = new ButtonBuilder()
            .setCustomId(`uniform_copy_preset_${selectedUniform.id}`)
            .setLabel('Copiar Código')
            .setStyle(ButtonStyle.Success)
            .setEmoji('📋');
        components.push(new ActionRowBuilder().addComponents(copyButton));
    }

    return { embeds: [embed], components };
};