const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = function generatePanelBuilder(panel) {
    // 1. O Embed de Visualização (Como o painel está agora)
    const previewEmbed = new EmbedBuilder()
        .setTitle(panel.title || 'Sem Título')
        .setDescription(panel.description || 'Sem descrição definida...')
        .setColor(0x2B2D31)
        .setFooter({ text: `Painel ID: ${panel.panel_id} • Modo de Edição` });

    if (panel.image_url) previewEmbed.setImage(panel.image_url);
    if (panel.thumbnail_url) previewEmbed.setThumbnail(panel.thumbnail_url);

    // 2. Resumo dos Cargos Adicionados
    const rolesList = panel.roles_data || [];
    let rolesSummary = rolesList.length > 0 
        ? rolesList.map(r => `${r.emoji || '🔸'} **${r.label}** (<@&${r.role_id}>)`).join('\n')
        : '*Nenhum cargo configurado.*';

    const statusEmbed = new EmbedBuilder()
        .setTitle('⚙️ Configurações Atuais')
        .setDescription(`**Cargos no Menu:**\n${rolesSummary}`)
        .setColor('Yellow');

    // 3. Botões de Controle
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aut_pnl_edit_title_${panel.panel_id}`).setLabel('Título').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
        new ButtonBuilder().setCustomId(`aut_pnl_edit_desc_${panel.panel_id}`).setLabel('Descrição').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
        new ButtonBuilder().setCustomId(`aut_pnl_edit_img_${panel.panel_id}`).setLabel('Imagem').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
        new ButtonBuilder().setCustomId(`aut_pnl_preview_${panel.panel_id}`).setLabel('Ver Preview Real').setStyle(ButtonStyle.Primary).setEmoji('👁️')
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aut_pnl_add_role_${panel.panel_id}`).setLabel('Adicionar Cargo').setStyle(ButtonStyle.Success).setEmoji('➕'),
        new ButtonBuilder().setCustomId(`aut_pnl_rem_role_${panel.panel_id}`).setLabel('Remover Cargo').setStyle(ButtonStyle.Danger).setEmoji('➖'),
        new ButtonBuilder().setCustomId(`aut_btn_send_panel_${panel.panel_id}`).setLabel('PUBLICAR PAINEL').setStyle(ButtonStyle.Success).setEmoji('📤')
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('aut_button_roles_menu').setLabel('Voltar ao Menu').setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [previewEmbed, statusEmbed], components: [row1, row2, row3] };
};