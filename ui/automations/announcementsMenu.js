// Substitua o conteúdo em: ui/automations/announcementsMenu.js
const { EPHEMERAL_FLAG } = require('../../utils/constants');

async function buildAnnouncementsMenu(interaction, announcements) {
    const guild = interaction.guild;
    let description = 'Gerencie os anúncios agendados do servidor.\n\n';

    if (announcements.length === 0) {
        description += '**Nenhum anúncio criado.**\nUse o botão abaixo para criar seu primeiro anúncio.';
    }

    const v2_components = [
        {
            type: 10,
            content: "## 📣 Gerenciador de Anúncios"
        },
        {
            type: 10,
            content: description
        },
        { type: 14, divider: true, spacing: 2 },
        {
            type: 1,
            components: [
                {
                    type: 2, style: 3, label: 'Criar Novo Anúncio',
                    emoji: { name: '➕' }, custom_id: 'aut_ann_create_new',
                    disabled: announcements.length >= 25
                }
            ]
        }
    ];

    if (announcements.length > 0) {
        const options = await Promise.all(announcements.map(async (ann) => {
            let channelName = 'Canal ?';
            try {
                const channel = await guild.channels.cache.get(ann.channel_id);
                if (channel) channelName = channel.name;
            } catch (e) {}

            return {
                label: ann.name.substring(0, 100),
                value: ann.announcement_id.toString(),
                description: `#${channelName} | ${ann.cron_string} | ${ann.enabled ? 'Ativo' : 'Inativo'}`.substring(0, 100),
                emoji: { name: ann.enabled ? '🟢' : '🔴' }
            };
        }));

        v2_components.push({
            type: 1,
            components: [
                {
                    type: 3, custom_id: 'aut_ann_select_manage',
                    placeholder: 'Selecione um anúncio para gerenciar',
                    options: options
                }
            ]
        });
    }

    // --- CORREÇÃO AQUI ---
    // O valor '10' era inválido. Alterado para '2' (grande).
    v2_components.push({ type: 14, divider: true, spacing: 2 });
    v2_components.push({
        type: 1,
        components: [
            {
                type: 2, style: 2, label: 'Voltar',
                emoji: { name: '⬅️' }, custom_id: 'open_automations_menu'
            }
        ]
    });

    return [
        {
            type: 17,
            accent_color: 42751,
            components: v2_components.filter(Boolean)
        }
    ];
}

module.exports = buildAnnouncementsMenu;