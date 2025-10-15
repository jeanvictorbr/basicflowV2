// ui/guildArchitect/blueprintDisplay.js

module.exports = function generateBlueprintDisplay(blueprint, sessionId) {
    if (!blueprint || !blueprint.categories || blueprint.categories.length === 0) {
        return [{
            type: 17,
            accent_color: 15548997, // Red
            components: [
                { type: 10, content: "## ❌ Erro no Blueprint" },
                { type: 10, content: "> A IA não conseguiu gerar um plano válido. Por favor, tente novamente com uma descrição mais clara do seu servidor." },
                { type: 1, components: [{ type: 2, style: 2, label: "Voltar", custom_id: "open_architect_menu" }] }
            ]
        }];
    }

    const description = `A IA gerou o seguinte plano para o seu servidor. Revise os canais e cargos. Se estiver de acordo, clique em "Confirmar Construção" para que eu crie tudo para você.`;

    const fields = blueprint.categories.map(category => {
        const channels = category.channels.map(channel => {
            const typeEmoji = channel.type === 'text' ? '📄' : '🔊';
            return `${typeEmoji} ${channel.name}`;
        }).join('\n') || '> Nenhum canal nesta categoria.';
        return `**📁 ${category.name}**\n${channels}`;
    }).join('\n\n');
    
    // Divide a descrição em múltiplos embeds se passar do limite de 4096 caracteres
    const embeds = [];
    const fieldChunks = splitText(fields, 4000); // Helper para quebrar texto grande
    
    for (let i = 0; i < fieldChunks.length; i++) {
        const embed = {
            title: `🏗️ Planta Baixa do Servidor (Parte ${i + 1})`,
            description: i === 0 ? description : '',
            color: 0x3498DB,
            fields: [{ name: 'Estrutura Proposta', value: fieldChunks[i] }]
        };
        if (i === fieldChunks.length - 1) { // Adiciona cargos e rodapé apenas no último embed
            embed.fields.push({
                name: 'Cargos a Serem Criados',
                value: blueprint.roles && blueprint.roles.length > 0 ? blueprint.roles.map(r => `- ${r.name}`).join('\n') : '> Nenhum cargo adicional.'
            });
            embed.footer = { text: `Sessão do Arquiteto: ${sessionId}` };
        }
        embeds.push(embed);
    }

    const components = [
        {
            type: 1,
            components: [
                { type: 2, style: 3, label: "Confirmar Construção", emoji: { name: "🚀" }, custom_id: `architect_confirm_build_${sessionId}` },
                { type: 2, style: 4, label: "Cancelar", custom_id: `architect_cancel_build_${sessionId}` }
            ]
        }
    ];

    return { embeds, components };
}

// Função auxiliar para dividir texto grande em pedaços para os embeds
function splitText(text, maxLength) {
    const chunks = [];
    let currentChunk = '';
    const lines = text.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length + 2 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        currentChunk += line + '\n';
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}