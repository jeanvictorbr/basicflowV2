// utils/aiKnowledgeBase.js
const db = require('../database.js');

// MEMÓRIA FIXA DO BASICFLOW - VERSÃO COMPLETA E DETALHADA
const baseKnowledge = [
    { 
        topic: "Visão Geral e Comandos Principais do BasicFlow", 
        keywords: ["basicflow", "bot", "o que é", "funções", "ajuda", "comandos", "geral", "configurar"], 
        content: `Eu sou o BasicFlow, um assistente multifuncional para Discord, criado por "ze pqueno" para automatizar e gerenciar operações em servidores, especialmente os de FiveM. Minha função é ajudar tanto os membros quanto os administradores com sistemas inteligentes.\n\n**Para Administradores:** O comando principal para gerenciar todos os meus módulos é o \`/configurar\`. Ele abre um painel interativo onde você pode configurar tudo.\n\n**Para Usuários:** Para usar minhas funções, procure pelos painéis de botões nos canais específicos do servidor, como o painel de "Abrir Ticket" ou o de "Bate-Ponto".` 
    },
    { 
        topic: "Sistema Premium e Ativação de Chaves", 
        keywords: ["premium", "chave", "key", "vantagens", "pago", "ativar", "licença", "cupom", "comprar"], 
        content: `O sistema Premium desbloqueia minhas funcionalidades mais avançadas, como a IA conversacional, moderação automática e estatísticas detalhadas.\n\n**Como ativar sua chave (licença/cupom):**\n1. Use o comando \`/configurar\` em qualquer canal de texto.\n2. No menu principal que aparecer, clique no botão verde **"Ativar Key"**.\n3. Uma janela (modal) se abrirá. Cole sua chave de ativação no campo de texto e clique em "Enviar".\n4. Se a chave for válida, as novas funcionalidades serão liberadas imediatamente no seu servidor!\n\n**Funcionalidades Premium incluem:**\n- **Guardian AI:** Moderação automática e IA de conversação.\n- **Moderação Premium:** Ferramentas avançadas para a staff, como histórico de punições e monitoramento.\n- **Estatísticas:** Gráficos e dados sobre o uso do servidor.\n- **Customização Visual:** Permite alterar imagens e cores dos painéis.\n- **Tickets Premium:** Departamentos, auto-fechamento, avaliações e mais.\n- **Ponto Premium:** Verificação de inatividade (AFK) e personalização do painel.` 
    },
    { 
        topic: "Sistema de Tickets e Suporte", 
        keywords: ["ticket", "suporte", "atendimento", "departamento", "avaliação", "feedback", "fechar ticket", "trancar", "assumir"], 
        content: `Meu sistema de tickets agiliza o suporte no servidor.\n\n**Para Usuários:**\n1. Procure o painel de "Central de Atendimento" e clique no botão **"Abrir Ticket"**.\n2. Se o servidor usar departamentos (recurso Premium), selecione a área mais adequada para seu problema.\n3. Um canal privado será criado para você e a equipe de suporte. Descreva seu problema em detalhes.\n4. Um assistente de IA pode te dar a primeira resposta. Para cancelar o atendimento, você pode clicar em "Desistir do Ticket".\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Tickets"**.\n2. Configure a **Categoria** onde os tickets serão criados, o **Cargo de Suporte** e o **Canal de Logs**.\n3. Publique o painel em um canal usando o botão **"Publicar Painel"**.\n4. No menu "Config. Premium", você pode ativar Departamentos, Mensagens de Saudação, Auto-Fechamento, Avaliações e o Assistente de IA.` 
    },
    { 
        topic: "Sistema de Bate-Ponto", 
        keywords: ["ponto", "bater ponto", "serviço", "horas", "ranking", "pausar", "afk", "meu status", "consultar jogador"], 
        content: `Meu sistema de Bate-Ponto permite que membros registrem seu tempo de serviço de forma fácil.\n\n**Para Usuários:**\n1. No painel de Bate-Ponto, clique em **"Iniciar Serviço"**.\n2. Você receberá um painel pessoal em sua mensagem direta (DM) com botões para **"Pausar"**, **"Retomar"** e **"Finalizar"** o serviço.\n3. O tempo em pausa não é contabilizado. Ao finalizar, suas horas são salvas no ranking.\n4. Você pode ver o ranking geral clicando no botão **"Ranking Ponto"** no painel principal.\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Bate-Ponto"**.\n2. Defina o **Canal de Logs** (onde os registros de entrada e saída aparecem) e o **Cargo em Serviço**.\n3. Ative o sistema e publique o painel com o botão **"Publicar Painel"**.\n4. No menu "Config. Premium", você pode ativar a verificação de inatividade (AFK) e personalizar a aparência do painel.` 
    },
    { 
        topic: "Sistema de Registros (Whitelist)", 
        keywords: ["registro", "registrar", "whitelist", "aprovar", "recusar", "ficha", "id rp"], 
        content: `Este módulo automatiza a entrada de novos membros no servidor (whitelist).\n\n**Para Usuários:**\n1. No painel de "Sistema de Registro", clique em **"Iniciar Registro"**.\n2. Preencha o formulário com seu **Nome no RP** e **ID no servidor RP**.\n3. Sua ficha será enviada para análise e você será notificado do resultado.\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Registros"**.\n2. Configure o **Canal de Aprovações** (para onde as fichas são enviadas), o **Cargo de Aprovado** e o **Canal de Logs**.\n3. Você também pode definir uma **Tag de Aprovado** que será adicionada ao apelido do membro (ex: "[Aprovado] Nome | ID").\n4. Ative o sistema e publique a vitrine com o botão **"Publicar Vitrine"**.` 
    },
    { 
        topic: "Sistema de Ausências", 
        keywords: ["ausência", "ausente", "férias", "afastamento", "licença"], 
        content: `Este sistema permite que os membros solicitem formalmente um período de afastamento.\n\n**Para Usuários:**\n1. No painel de "Central de Ausências", clique em **"Solicitar Ausência"**.\n2. Preencha o formulário com a data de início, data de término e o motivo.\n3. Sua solicitação será enviada para aprovação da staff.\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Ausências"**.\n2. Configure o **Canal de Aprovações**, o **Cargo para Ausentes** e o **Canal de Logs**.\n3. Publique a vitrine onde os membros farão as solicitações.` 
    },
    { 
        topic: "Sistema de Uniformes", 
        keywords: ["uniforme", "farda", "preset", "código", "roupa", "vestiário"], 
        content: `Este módulo funciona como um vestiário virtual para exibir os uniformes da sua organização.\n\n**Para Usuários:**\n1. No painel de "Vestiário", use o menu de seleção para escolher um uniforme.\n2. A imagem e o código do preset aparecerão no painel.\n3. Clique no botão **"Copiar Código"** para receber uma mensagem privada com o código, facilitando o uso no jogo.\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Uniformes"**.\n2. Use os botões **"Adicionar"**, **"Editar"** ou **"Remover"** para gerenciar os uniformes e seus códigos de preset.\n3. Após configurar, publique a vitrine em um canal público.` 
    },
    { 
        topic: "Módulo de Moderação", 
        keywords: ["moderação", "dossiê", "histórico", "notas", "punir", "banir", "kickar", "silenciar", "punições personalizadas", "revogar"], 
        content: `Minhas ferramentas de moderação centralizam as ações da sua equipe.\n\n**Para a Staff:**\n- **Comandos:** Use \`/ban\`, \`/kick\`, \`/timeout\` e \`/warn\` para aplicar punições rápidas.\n- **Dossiê:** Clique com o botão direito em um usuário e vá em "Apps > Ver Dossiê" para ver todo o histórico de punições dele.\n- **Hub de Moderação:** Use \`/configurar\` e abra o menu "Moderação". Lá você pode definir o canal de logs e quais cargos têm permissão para moderar.\n\n**Recursos Premium:**\n- **Punições Personalizadas:** Crie modelos de punição (ex: "Mute Leve" com 30min e cargo "Silenciado") para padronizar as ações.\n- **Punições Ativas:** Visualize e revogue todos os mutes e bans temporários que ainda estão ativos no servidor.\n- **Monitor de Expiração:** O bot remove automaticamente os cargos e punições quando o tempo delas acaba.` 
    },
    { 
        topic: "Guardian AI", 
        keywords: ["guardian", "ia", "moderação automática", "políticas", "escalonamento", "toxicidade", "spam", "menções", "alertas de conflito"], 
        content: `O Guardian AI é meu sistema de moderação proativo e automático (Premium).\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Guardian AI"**.\n2. Ative o módulo e defina os **Canais Monitorados** onde a IA deve atuar.\n3. Em **"Sistema de Regras"**, você pode criar "Políticas" para diferentes infrações (toxicidade, spam, etc.).\n4. Para cada política, crie "Passos" de escalonamento. Exemplo: Se um usuário repetir a mesma mensagem 3 vezes (1º passo), apague a mensagem. Se ele repetir 5 vezes (2º passo), aplique um mute de 10 minutos.\n5. Você pode integrar o Guardian com o Módulo de Moderação para que a IA aplique as suas punições personalizadas.\n6. O **"Hub de Alertas de Conflito"** é um sistema passivo que avisa a staff em um canal privado se detectar o início de uma briga, analisando o nível de sarcasmo e ataques pessoais na conversa.` 
    },
    {
        topic: "Sistema de Tags por Cargo (RoleTags)",
        keywords: ["roletags", "tags", "tag", "apelido", "nickname", "sincronizar"],
        content: `Este sistema adiciona um prefixo (tag) ao apelido dos membros com base no cargo mais alto que eles possuem.\n\n**Para Administradores:**\n1. Use \`/configurar\` e abra o menu **"Tags por Cargo"**.\n2. Clique em **"Adicionar / Editar"** para associar uma tag (ex: "[ADM]") a um cargo (ex: "Administrador").\n3. Ative o sistema no botão "Ativar Sistema".\n4. Para aplicar as tags a todos os membros do servidor de uma só vez, use o botão **"Sincronizar Todos"**.`
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