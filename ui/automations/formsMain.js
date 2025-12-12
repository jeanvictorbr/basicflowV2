module.exports = (counts) => {
    return {
        type: 17,
        components: [
            { type: 10, content: "## 📝 Sistema de Formulários", style: 1 },
            { type: 10, content: `Crie formulários interativos (Modais) para recrutamento, denúncias ou feedback. As respostas são enviadas para um canal de logs.\n\n**Formulários Criados:** \`${counts}\` (Máx: 10)`, style: 2 },
            
            { type: 14, spacing: 1 },
            { type: 10, content: "### 📚 Tutorial Rápido" },
            { type: 10, content: "1. Clique em **Criar Novo** e defina um ID e Título.\n2. Adicione perguntas (até 5) no painel de edição.\n3. Defina o **Canal de Logs** onde as respostas cairão.\n4. Use o botão **Postar Painel** para enviar a mensagem clicável para os membros." },
            
            { type: 14, spacing: 2 },
            { 
                type: 1, 
                components: [
                    { type: 2, style: 3, label: "Criar Novo", emoji: { name: "➕" }, custom_id: "aut_forms_new" },
                    { type: 2, style: 1, label: "Gerenciar / Postar", emoji: { name: "⚙️" }, custom_id: "aut_forms_manage" },
                    { type: 2, style: 2, label: "Voltar", emoji: { name: "⬅️" }, custom_id: "aut_page_2" }
                ]
            }
        ]
    };
};