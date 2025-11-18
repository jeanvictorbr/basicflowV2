// Local: ui/automations/purgeMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

function getPurgeMenu(configs) {
    const innerComponents = [];

    // 1. Cabeçalho
    innerComponents.push({
        type: 10,
        content: "## 🧹 Sistema de Auto-Purge"
    });

    // 2. Descrição
    innerComponents.push({
        type: 10,
        content: "Mensagens mais antigas que o tempo definido serão apagadas automaticamente."
    });

    // 3. Lista de Canais (Dinâmica)
    if (configs.length === 0) {
        innerComponents.push({
            type: 10,
            content: "### 💤 Nenhum canal configurado\nClique em **Adicionar Canal** para começar a limpar seu chat automaticamente."
        });
    } else {
        let listContent = "### 📋 Canais Monitorados:\n";
        configs.forEach(config => {
            const status = config.enabled ? "🟢" : "🔴";
            listContent += `• <#${config.channel_id}> ⏳ **${config.max_age_hours}h** ${status}\n`;
        });
        innerComponents.push({
            type: 10,
            content: listContent
        });
    }

    // Divisor
    innerComponents.push({ type: 14, divider: true, spacing: 2 });

    // 4. Botão de Adicionar (Estilo Lista V2)
    innerComponents.push({
        type: 9, // Accessory Layout
        accessory: {
            type: 2, // Button
            style: 3, // Green
            label: 'Adicionar',
            custom_id: 'aut_purge_add',
            emoji: { name: '➕' }
        },
        components: [
            { type: 10, content: "Novo Agendamento" },
            { type: 10, content: "Configure a limpeza automática em um novo canal." }
        ]
    });

    // 5. Botão de Remover (Apenas se houver configs)
    if (configs.length > 0) {
        innerComponents.push({ type: 14, divider: true, spacing: 2 });
        innerComponents.push({
            type: 9,
            accessory: {
                type: 2,
                style: 4, // Red
                label: 'Remover',
                custom_id: 'aut_purge_manage_select_mode',
                emoji: { name: '🗑️' }
            },
            components: [
                { type: 10, content: "Remover Configuração" },
                { type: 10, content: "Selecione um canal para parar a limpeza." }
            ]
        });
    }

    // 6. Rodapé / Botão Voltar
    innerComponents.push({ type: 14, divider: true, spacing: 2 });
    
    // Botões de navegação padrão ficam num ActionRow (Type 1) no final
    innerComponents.push({
        type: 1,
        components: [
            {
                type: 2,
                label: 'Voltar',
                style: 2, // Secondary
                custom_id: 'open_automations_menu',
                emoji: { name: '⬅️' }
            }
        ]
    });

    // Estrutura Final do Payload V2
    return {
        // IMPORTANTE: Sem 'embeds'!
        components: [
            {
                type: 17, // Container V2
                accent_color: 0x2b2d31,
                components: innerComponents
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
}

module.exports = { getPurgeMenu };