// Substitua em: ui/dossieEmbed.js
const { PermissionsBitField } = require('discord.js');

module.exports = function generateDossieEmbed(member, history, notes, interaction) {
    // Calcula o resumo das infrações
    const summary = { WARN: 0, TIMEOUT: 0, KICK: 0, BAN: 0 };
    history.forEach(log => {
        if (summary[log.action.toUpperCase()] !== undefined) {
            summary[log.action.toUpperCase()]++;
        }
    });

    // Formata o histórico de punições
    const historyText = history.length > 0
        ? history.slice(0, 3).map(log => { // Mostra as 3 mais recentes
            const duration = log.duration ? ` (Duração: ${log.duration})` : '';
            return `> **[${log.action}]** por <@${log.moderator_id}> em <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:d>${duration}\n> └─ Motivo: *${log.reason}*`;
        }).join('\n\n')
        : '> Nenhuma ocorrência encontrada para este membro.';
    
    // Formata o histórico de notas
    const notesText = notes.length > 0
        ? notes.slice(0, 3).map(note => { // Mostra as 3 mais recentes
            return `> 💬 por <@${note.moderator_id}> em <t:${Math.floor(new Date(note.created_at).getTime() / 1000)}:d>\n> └─ *"${note.content}"*`;
        }).join('\n\n')
        : '> Nenhuma nota interna adicionada.';

    const canPunish = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || (member.roles.highest.position < interaction.member.roles.highest.position);

    const components = [
        {
            "type": 17, "accent_color": 15158332,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 11, "media": { "url": member.user.displayAvatarURL({ size: 128 }) } },
                    "components": [
                        { "type": 10, "content": `## Dossiê de ${member.user.username}` },
                        { "type": 10, "content": `> **ID:** \`${member.id}\`\n> **Juntou-se em:** <t:${Math.floor(member.joinedTimestamp / 1000)}:f>` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**Resumo:** ⚠️ ${summary.WARN} | 🔇 ${summary.TIMEOUT} | 🚪 ${summary.KICK} | 🚫 ${summary.BAN}`},
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### Histórico Recente de Moderação" },
                { "type": 10, "content": historyText },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### Notas Internas da Staff" },
                { "type": 10, "content": notesText },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Aplicar Punição", "emoji": { "name": "⚖️" }, "custom_id": `mod_aplicar_punicao_${member.id}`, "disabled": !canPunish },
                        { "type": 2, "style": 1, "label": "Adicionar Nota", "emoji": { "name": "📝" }, "custom_id": `mod_adicionar_nota_${member.id}` } // Botão ativado
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub", "emoji": { "name": "↩️" }, "custom_id": "mod_open_hub" }] }
            ]
        }
    ];
    return { components };
};