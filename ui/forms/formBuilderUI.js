module.exports = {
    getFormBuilderPanel: (data) => {
        // data: { customId, title, questions, logChannelId, approvedRoleId }
        
        let questionsText = data.questions.map((q, i) => `**${i+1}.** ${q.label} *(${q.style === 1 ? 'Curto' : 'Longo'})*`).join('\n');
        if (!questionsText) questionsText = "*Nenhuma pergunta definida.*";

        const logStatus = data.logChannelId ? `✅ Logs: <#${data.logChannelId}>` : `⚠️ **Sem canal de logs**`;
        const roleStatus = data.approvedRoleId ? `✅ Cargo: <@&${data.approvedRoleId}>` : `🔘 Sem cargo automático`;

        return {
            type: 17, // Container V2
            components: [
                { type: 10, content: `## 🛠️ Editor: ${data.title}`, style: 1 },
                { type: 10, content: `**ID:** \`${data.customId}\`\n${logStatus} • ${roleStatus}`, style: 2 },
                { type: 14, spacing: 1 },
                { type: 10, content: `### Perguntas (${data.questions.length}/5):\n${questionsText}` },
                
                // --- BOTÕES DE CONFIGURAÇÃO ---
                { type: 1, components: [
                    { type: 2, style: 1, label: "Add Pergunta", custom_id: `form_add_q_${data.customId}`, emoji: { name: "➕" }, disabled: data.questions.length >= 5 },
                    { type: 2, style: 2, label: "Canal Logs", custom_id: `form_set_log_${data.customId}`, emoji: { name: "📜" } },
                    { type: 2, style: 2, label: "Cargo Aprovação", custom_id: `form_set_role_${data.customId}`, emoji: { name: "👑" } },
                    { type: 2, style: 2, label: "Limpar", custom_id: `form_clear_q_${data.customId}`, emoji: { name: "🗑️" } }
                ]},
                
                // --- BOTÃO DE AÇÃO (POSTAR) EM NOVA LINHA PARA DESTAQUE ---
                { type: 1, components: [
                    { type: 2, style: 3, label: "POSTAR PAINEL NO CANAL", custom_id: `form_post_start_${data.customId}`, emoji: { name: "📨" }, disabled: !data.logChannelId }
                ]}
            ]
        };
    }
};