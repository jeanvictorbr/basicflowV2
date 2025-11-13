// Crie/Substitua o arquivo em: ui/automations/manageButtonsMenu.js
const { ChannelType } = require('discord.js');

async function buildManageButtonsMenu(interaction, announcement) {
    const annId = announcement.announcement_id;
    const contentData = announcement.content_data || {};
    const buttons = contentData.buttons || [];

    let description = 'Gerencie os botões de link para este anúncio.\n**Máximo de 5 botões.**\n\n**Botões Atuais:**\n';

    // Lista os botões atuais
    if (buttons.length === 0) {
        description += 'Nenhum botão configurado.';
    } else {
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            let channelName = btn.channel_id;
            try {
                const channel = await interaction.guild.channels.cache.get(btn.channel_id);
                if (channel) channelName = `#${channel.name}`;
                else channelName = `Canal Deletado (${btn.channel_id})`;
            } catch (e) {}
            description += `**${i + 1}.** ${btn.label} → ${channelName}\n`;
        }
    }

    const v2_components = [
        {
            type: 10,
            content: `## 🔘 Gerenciando Botões: ${announcement.name}`
        },
        {
            type: 10,
            content: description
        },
        { type: 14, divider: true, spacing: 2 },
        { // Action Row 1: Adicionar e Voltar
            type: 1,
            components: [
                {
                    type: 2, style: 3, label: 'Adicionar Botão',
                    emoji: { name: '➕' }, custom_id: `aut_btn_add_${annId}`,
                    disabled: buttons.length >= 5 // Desativa se já tiver 5 botões
                },
                { 
                    type: 2, style: 2, label: 'Voltar', 
                    emoji: { name: '⬅️' }, 
                    custom_id: `aut_ann_back_to_manage_${annId}` // Botão de voltar
                }
            ]
        }
    ];

    // Action Row 2: Remover (Só aparece se houver botões)
    if (buttons.length > 0) {
        // Cria as opções para o select menu
        const options = buttons.map((btn, index) => ({
            label: `Remover Botão ${index + 1}: ${btn.label}`,
            value: index.toString(), // O valor será o índice no array
            emoji: { name: '🗑️' }
        }));

        v2_components.push({
            type: 1,
            components: [
                {
                    type: 3, // Select Menu
                    custom_id: `aut_btn_remove_select_${annId}`,
                    placeholder: 'Selecione um botão para remover',
                    options: options
                }
            ]
        });
    }

    return [
        {
            type: 17,
            accent_color: 42751,
            components: v2_components
        }
    ];
}

module.exports = buildManageButtonsMenu;