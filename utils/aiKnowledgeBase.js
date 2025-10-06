// utils/aiKnowledgeBase.js
const db = require('../database.js');

// MEMÓRIA FIXA DO BASICFLOW
const baseKnowledge = [
    { topic: "Visão Geral do BasicFlow", keywords: ["basicflow", "bot", "o que é", "funciona", "funções", "geral"], content: `O BasicFlow é um bot multifuncional para Discord focado em servidores de FiveM, desenvolvido por "ze pqueno". Ele possui sistemas modulares para automatizar e gerir as principais operações de um servidor, como tickets, bate-ponto, registros de novos membros, ausências e uniformes. Existem funcionalidades básicas e funcionalidades Premium que requerem uma chave de ativação.` },
    { topic: "Sistema de Bate-Ponto", keywords: ["ponto", "bater ponto", "serviço", "horas", "ranking", "pausar", "afk", "meu status", "consultar jogador"], content: `O sistema de Bate-Ponto permite registar o tempo de serviço. Para começar, use o botão "Iniciar Serviço" no painel de ponto. Enquanto estiver em serviço, você receberá um cargo específico e um painel pessoal na sua DM para "Pausar", "Retomar" ou "Finalizar" o serviço. O tempo em pausa não é contabilizado. O painel principal tem um botão para ver o Ranking de horas. Se a verificação de inatividade (AFK) estiver ativa, o bot enviará uma DM para confirmar sua atividade, finalizando o ponto se não houver resposta.` },
    { topic: "Sistema de Tickets e Suporte", keywords: ["ticket", "suporte", "ajuda", "atendimento", "departamento", "avaliação", "feedback", "fechar ticket", "trancar", "assumir"], content: `Para obter ajuda, clique em "Abrir Ticket". Se o servidor tiver Departamentos (Premium), você escolherá a área do problema. Um canal privado será criado. A IA dará a primeira resposta e continuará a conversa até que um membro da equipa de suporte (que não seja o autor do ticket) envie uma mensagem. A equipa pode usar botões para "Assumir", "Trancar", "Alertar" e "Adicionar/Remover" membros. Após o fecho, o utilizador pode receber um pedido de avaliação por DM.` },
    { topic: "Sistema de Registros", keywords: ["registro", "registrar", "whitelist", "aprovar", "recusar", "ficha", "id rp"], content: `O sistema de Registros (ou whitelist) serve para aprovar novos membros. O utilizador clica em "Iniciar Registro", preenche um formulário com Nome e ID do RP. A ficha é enviada para a administração. Se for aprovada, o bot automaticamente atribui um cargo e altera o apelido do membro para o padrão do servidor. Se for recusada, o motivo é enviado por DM.` },
    { topic: "Sistema de Ausências", keywords: ["ausência", "ausente", "férias", "afastamento", "licença"], content: `Membros podem solicitar um período de ausência clicando em "Solicitar Ausência". Eles preenchem um formulário com datas de início/término e o motivo. Se a administração aprovar, o bot atribui o cargo de "Ausente" ao membro.` },
    { topic: "Sistema de Uniformes", keywords: ["uniforme", "farda", "preset", "código", "roupa", "vestiário"], content: `O sistema de Uniformes é um vestiário virtual. No painel, o membro seleciona um uniforme da lista. A imagem e o "Código do Preset" são exibidos. Um botão "Copiar Código" envia o código numa mensagem privada para facilitar o uso no jogo.` },
    { topic: "Sistema Premium", keywords: ["premium", "chave", "key", "vantagens", "pago", "ativar", "estatísticas"], content: `O Premium é ativado com uma chave de licença e desbloqueia funcionalidades avançadas como: Assistente de IA, Estatísticas detalhadas do servidor, personalização completa de imagens e cores, Departamentos de Suporte, Auto-Fechamento de Tickets, Sistema de Avaliações e verificação de inatividade (AFK) no Bate-Ponto.` }
];

async function searchKnowledge(guildId, query, useBaseKnowledge) {
    if (!query) return '';

    let knowledgeToSearch = [];

    if (useBaseKnowledge) {
        knowledgeToSearch.push(...baseKnowledge);
    }

    const guildKnowledge = (await db.query('SELECT keywords, content FROM ai_knowledge_base WHERE guild_id = $1', [guildId])).rows;
    if (guildKnowledge.length > 0) {
        knowledgeToSearch.push(...guildKnowledge);
    }
    
    if (knowledgeToSearch.length === 0) return '';

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const foundTopics = new Set();

    knowledgeToSearch.forEach(item => {
        let keywords = [];
        // LÓGICA CORRIGIDA: Verifica se as palavras-chave são uma string ou uma array
        if (typeof item.keywords === 'string') {
            keywords = item.keywords.toLowerCase().split(',').map(k => k.trim());
        } else if (Array.isArray(item.keywords)) {
            keywords = item.keywords.map(k => k.toLowerCase().trim());
        }

        for (const keyword of keywords) {
            if (queryWords.some(word => keyword.includes(word) || word.includes(keyword))) {
                foundTopics.add(item.content);
                break;
            }
        }
    });

    return Array.from(foundTopics).join('\n\n---\n\n');
}

module.exports = { searchKnowledge };