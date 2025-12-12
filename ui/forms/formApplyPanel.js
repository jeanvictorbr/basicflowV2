module.exports = {
    getFormApplyPanel: (data) => {
        // data: { custom_id, title, description, button_label }
        return {
            type: 17,
            components: [
                { type: 10, content: `## 📝 ${data.title}`, style: 1 },
                { type: 10, content: data.description || "Clique no botão abaixo para preencher o formulário.", style: 2 },
                { type: 14, spacing: 2 },
                { type: 1, components: [
                    { type: 2, style: 1, label: data.button_label || "Iniciar", custom_id: `form_start_${data.custom_id}`, emoji: { name: "✍️" } }
                ]}
            ]
        };
    }
};