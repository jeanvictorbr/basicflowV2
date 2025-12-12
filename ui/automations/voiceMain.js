module.exports = (config) => {
    const channelStatus = config ? `<#${config.trigger_channel_id}>` : "🔴 **Não definido**";
    const categoryStatus = config && config.category_id ? `<#${config.category_id}>` : "📂 **Automático** (Mesma do canal)";

    return {
        type: 17,
        components: [
            { type: 10, content: "## 🔊 Hub de Voz Temporário", style: 1 },
            { type: 10, content: `Sistema "Join-to-Create". Quando um usuário entra no canal gatilho, o bot cria uma sala privada para ele e move-o automaticamente.`, style: 2 },
            
            { type: 14, spacing: 1 },
            { type: 10, content: "### ⚙️ Configuração Atual" },
            { type: 10, content: `🎤 **Canal Gatilho:** ${channelStatus}\n📂 **Categoria Alvo:** ${categoryStatus}` },
            
            { type: 14, spacing: 1 },
            { type: 10, content: "### 📚 Tutorial" },
            { type: 10, content: "1. Crie um canal de voz no Discord chamado 'Criar Sala' (ou similar).\n2. Clique em **Definir Canal Gatilho** abaixo e selecione-o.\n3. (Opcional) Defina uma categoria específica para as novas salas.\n4. **Pronto!** Teste entrando no canal." },

            { type: 14, spacing: 2 },
            { 
                type: 1, 
                components: [
                    { type: 2, style: 1, label: "Definir Canal Gatilho", emoji: { name: "🎤" }, custom_id: "aut_voice_sel_trig" },
                    { type: 2, style: 2, label: "Definir Categoria", emoji: { name: "📂" }, custom_id: "aut_voice_sel_cat" },
                    { type: 2, style: 2, label: "Voltar", emoji: { name: "⬅️" }, custom_id: "aut_page_2" }
                ]
            }
        ]
    };
};