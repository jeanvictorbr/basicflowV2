// utils/aiKnowledgeBase.js
const db = require('../database.js');

// MEMÓRIA FIXA - VERSÃO UNIFICADA (BasicFlow + FactionFlow)
const baseKnowledge = [
    // --- CONHECIMENTO GERAL ---
    { 
        topic: "Visão Geral e Diferenças dos Bots", 
        keywords: ["qual a diferença", "basicflow ou factionflow", "qual usar", "ajuda", "comandos"], 
        content: `Eu sou um assistente com conhecimento sobre dois bots distintos: o **BasicFlow** e o **FactionFlow**.\n\n- **BasicFlow** é um bot de gestão geral para servidores, com módulos como Bate-Ponto, Tickets de Suporte, Registros (Whitelist), Ausências e Uniformes. É ideal para a administração diária da comunidade.\n\n- **FactionFlow** é um bot especializado para servidores de RP com foco em facções. Ele gerencia o arsenal, finanças, membros, hierarquia e operações das facções, tudo de forma automatizada.\n\nQuando tiver uma dúvida, por favor, especifique sobre qual bot você quer saber para que eu possa te ajudar melhor!` 
    },

    // ===============================================================================================
    // ================================ CONHECIMENTO DO BASICFLOW ====================================
    // ===============================================================================================
    { 
        topic: "[BasicFlow] Sistema Premium e Ativação", 
        keywords: ["basicflow premium", "ativar basicflow", "key basicflow", "licença basicflow"], 
        content: `O Premium do BasicFlow é ativado com uma chave de licença (key/cupom) e desbloqueia funcionalidades avançadas.\n\n**Para ativar sua chave no BasicFlow:**\n1. Use o comando \`/configurar\`.\n2. No menu principal, clique no botão verde **"Ativar Key"**.\n3. Cole sua chave na janela que aparecer e envie.\n\n**Funcionalidades Premium do BasicFlow:** Módulo de Moderação completo, Guardian AI (IA de moderação e chat), Estatísticas detalhadas, customização de visuais, e recursos avançados para Tickets e Bate-Ponto.` 
    },
    { 
        topic: "[BasicFlow] Sistema de Tickets", 
        keywords: ["basicflow ticket", "basicflow suporte", "atendimento"], 
        content: `O sistema de tickets do BasicFlow agiliza o suporte no servidor.\n\n**Para Usuários:**\n1. Procure o painel "Central de Atendimento" e clique em **"Abrir Ticket"**.\n2. Se houver departamentos (Premium), selecione a área do problema.\n3. Um canal privado será criado para você e a equipe de suporte.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Tickets"**.\n2. Configure a Categoria dos tickets, o Cargo de Suporte e o Canal de Logs.\n3. Use **"Publicar Painel"** para criar o painel de abertura de tickets.` 
    },
    { 
        topic: "[BasicFlow] Sistema de Bate-Ponto", 
        keywords: ["basicflow ponto", "bater ponto", "serviço"], 
        content: `O Bate-Ponto do BasicFlow registra o tempo de serviço dos membros.\n\n**Para Usuários:**\n1. No painel de Bate-Ponto, clique em **"Iniciar Serviço"**.\n2. Você receberá um painel em sua DM para **"Pausar"**, **"Retomar"** e **"Finalizar"** o serviço.\n3. O tempo em pausa não é contabilizado.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Bate-Ponto"**.\n2. Defina o **Canal de Logs** e o **Cargo em Serviço**.\n3. Ative e publique o painel no canal desejado.` 
    },
    { 
        topic: "[BasicFlow] Sistema de Registros (Whitelist)", 
        keywords: ["basicflow registro", "whitelist", "aprovar"], 
        content: `Este módulo do BasicFlow automatiza a entrada de novos membros.\n\n**Para Usuários:**\n1. No painel de "Sistema de Registro", clique em **"Iniciar Registro"**.\n2. Preencha o formulário com seu **Nome no RP** e **ID no servidor RP**.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Registros"**.\n2. Configure o **Canal de Aprovações**, o **Cargo de Aprovado** e o **Canal de Logs**.` 
    },
    { 
        topic: "[BasicFlow] Guardian AI", 
        keywords: ["basicflow guardian", "ia", "moderação automática"], 
        content: `O Guardian AI do BasicFlow é um sistema de moderação proativo e automático (Premium).\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Guardian AI"**.\n2. Você pode ativar o **Chat com IA por Menção**, onde o bot conversa quando é mencionado.\n3. Em **"Sistema de Regras"**, você pode criar "Políticas" para diferentes infrações (toxicidade, spam, etc.) com "Passos" de escalonamento de punições.` 
    },
    
    // ===============================================================================================
    // =============================== CONHECIMENTO DO FACTIONFLOW ===================================
    // ===============================================================================================
    { 
        topic: "[FactionFlow] Visão Geral", 
        keywords: ["factionflow", "o que é factionflow", "facção", "facções"], 
        content: `O **FactionFlow** é um bot completo para gerenciamento de facções em servidores de RP. Ele permite que líderes controlem arsenal, finanças, membros, hierarquia, recrutamento e operações de forma automatizada e segura através de painéis interativos no Discord. O comando principal para administradores do servidor é \`/setup-modulos\`, e para líderes de facção, é \`/rpainel\`.`
    },
    { 
        topic: "[FactionFlow] Sistema de Hierarquia", 
        keywords: ["factionflow hierarquia", "cargos", "promover", "rebaixar"], 
        content: `O sistema de Hierarquia do FactionFlow permite visualizar a estrutura de cargos da facção.\n\n**Para Líderes:**\n1. Use o comando \`/rpainel\` e clique no botão **"Hierarquia"**.\n2. No menu, você pode definir o canal onde a hierarquia será exibida e quais cargos fazem parte dela.\n3. Ao clicar em **"Publicar"**, o bot cria um embed que é atualizado automaticamente sempre que um membro é promovido ou rebaixado no Discord, mostrando a contagem de membros em cada cargo.`
    },
    { 
        topic: "[FactionFlow] Sistema de Recrutamento", 
        keywords: ["factionflow recrutamento", "recrutar", "registro", "aceitar"], 
        content: `O sistema de Recrutamento do FactionFlow gerencia a entrada de novos membros para as facções.\n\n**Para Candidatos:**\n1. No painel de registro, o candidato clica em **"Iniciar Registro"**, preenche um formulário com seus dados e seleciona qual recrutador o está auxiliando.\n\n**Para Líderes e Recrutadores:**\n1. As fichas chegam em um canal de administração.\n2. Ao **"Aprovar"** um candidato, o bot automaticamente adiciona o cargo da facção, remove o cargo de recruta, atualiza a tag no apelido (se configurado) e registra o recrutamento para o recrutador selecionado.\n3. No painel \`/rpainel\`, em **"Recrutadores"**, é possível ver um ranking de quem mais recrutou.`
    },
    {
        topic: "[FactionFlow] Arsenal (Vendas)",
        keywords: ["factionflow arsenal", "vendas", "armas", "estoque", "finanças"],
        content: `O Arsenal do FactionFlow é um sistema completo para gerenciar vendas e estoque de itens da facção.\n\n**Para Líderes:**\n1. Use \`/rpainel\` e vá em **"Arsenal / Vendas"**.\n2. **Adicionar Itens:** Cadastre os itens que sua facção vende, definindo nome, preço, quantidade em estoque e uma imagem.\n3. **Registrar Venda:** Use o botão **"Registrar Venda"** para abrir um painel. Nele, você seleciona a categoria, o item e a quantidade. O bot calcula o valor total.\n4. **Confirmação e Logs:** Ao confirmar a venda, o bot pergunta se foi por "Depósito" ou "Dinheiro em Mãos" e registra tudo em um canal de logs, dando baixa no estoque automaticamente.\n5. **Finanças:** O sistema também controla o caixa da facção e permite registrar investimentos, como a compra de mais itens para o estoque, abatendo o valor do caixa.`
    },
    {
        topic: "[FactionFlow] Sistema de Justiça",
        keywords: ["factionflow justiça", "processos", "advogado", "juiz", "multa", "prisão"],
        content: `O módulo de Justiça do FactionFlow organiza os processos legais do servidor.\n\n**Para Advogados/Juízes:**\n1. Use o comando \`/justica\` para abrir o painel.\n2. **Registrar Punição:** Inicie um novo processo, selecionando o usuário, o tipo de crime/regra quebrada, as provas e a punição (multa ou prisão).\n3. **Histórico:** Todas as punições ficam salvas em um "dossiê" do cidadão, que pode ser consultado a qualquer momento para verificar reincidências.\n4. **Revogação:** É possível revogar uma punição, e o motivo da revogação também fica registrado.\n\n**Para Administradores:**\n- No menu de configuração do módulo, é possível definir os cargos de advogado, o canal de logs e as regras/crimes com suas punições padrão.`
    },
    {
        topic: "[FactionFlow] Controle de Acesso por Senha",
        keywords: ["factionflow senha", "acesso", "proteger", "password"],
        content: `O FactionFlow permite proteger módulos sensíveis com uma senha.\n\n**Para Líderes:**\n1. No painel de **"Controle de Acesso"**, selecione um módulo (ex: "Arsenal / Vendas").\n2. Clique em **"Definir Senha"** e crie uma senha para aquele módulo.\n3. A partir de então, qualquer membro que tentar acessar o painel do Arsenal precisará digitar a senha correta primeiro, garantindo uma camada extra de segurança para as operações da facção.`
    }
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