module.exports = (data) => {
    const statusText = `## 🎛️ Painel de Controle: ${data.channelName}\n👑 **Dono:** <@${data.ownerId}>`;

    const statusDetails = `
🔒 **Estado:** ${data.isLocked ? "Trancado (Privado)" : "Aberto (Público)"}
👁️ **Visibilidade:** ${data.isHidden ? "Oculto" : "Visível"}
👥 **Limite:** ${data.userLimit === 0 ? "Sem limite" : `${data.userLimit} usuários`}
    `.trim();

    return {
        type: 17, // Container V2
        components: [
            {
                type: 10, // Título
                content: statusText,
                style: 1
            },
            {
                type: 10, // Detalhes
                content: statusDetails,
                style: 2
            },
            {
                type: 14, // Separador
                spacing: 1
            },
            {
                type: 1, // Action Row (Botões)
                components: [
                    {
                        type: 2, // Trancar
                        style: data.isLocked ? 3 : 4,
                        label: data.isLocked ? "Destrancar" : "Trancar",
                        custom_id: `voice_toggle_lock_${data.channelId}`,
                        emoji: { name: data.isLocked ? "🔓" : "🔒" }
                    },
                    {
                        type: 2, // Ocultar
                        style: 2,
                        label: data.isHidden ? "Mostrar" : "Ocultar",
                        custom_id: `voice_toggle_hide_${data.channelId}`,
                        emoji: { name: data.isHidden ? "👁️" : "🙈" }
                    },
                    {
                        type: 2, // Renomear
                        style: 1,
                        label: "Renomear",
                        custom_id: `voice_rename_modal_${data.channelId}`,
                        emoji: { name: "✏️" }
                    },
                    {
                        type: 2, // MUTAR (NOVO)
                        style: 2,
                        label: "Mutar",
                        custom_id: `voice_mute_menu_${data.channelId}`,
                        emoji: { name: "🔇" }
                    },
                    {
                        type: 2, // Kick
                        style: 4,
                        label: "Kick",
                        custom_id: `voice_kick_menu_${data.channelId}`,
                        emoji: { name: "🚫" }
                    }
                ]
            }
        ]
    };
};