// Substitua o conteúdo em: ui/automations/announcementBuilder.js
const { parseColor } = require('../../utils/modUtils.js'); 

/**
 * Constrói um payload de anúncio.
 * @param {import('discord.js').Interaction} interaction 
 * @param {object} data 
 * @param {boolean} [mentionEveryone=false] - Se deve mencionar everyone
 */
function buildAnnouncementV2(interaction, { title, message, color, imageUrl, buttons = [] }, mentionEveryone = false) {
    const guild = interaction.guild;
    
    const descriptionWithLargeTitle = `# 📢 ${title}\n\n${message}`;

    const guildIcon = guild.iconURL() || null;
    const footer = {
        text: '⚠️ ANÚNCIO AGENDADO ⚠️',
        icon_url: guildIcon
    };
    
    const embed = {
        type: 'rich',
        description: descriptionWithLargeTitle,
        color: parseColor(color) || 0x2b2d31,
        footer: footer
    };

    if (imageUrl) {
        embed.image = { url: imageUrl };
    }

    let components = [];
    if (buttons && buttons.length > 0) {
        const buttonComponents = buttons.slice(0, 5).map(btn => ({ 
            type: 2, style: 5, label: btn.label,
            url: `https://discord.com/channels/${guild.id}/${btn.channel_id}`
        }));
        components.push({ type: 1, components: buttonComponents });
    }

    // Retorna o payload completo
    return {
        // CORREÇÃO: Adiciona @everyone se a flag estiver ativa
        content: mentionEveryone ? '@everyone' : '', 
        embeds: [embed],
        components: components
    };
}

module.exports = buildAnnouncementV2;