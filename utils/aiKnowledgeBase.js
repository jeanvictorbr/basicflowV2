// utils/aiKnowledgeBase.js
const db = require('../database.js');

// MEMÓRIA FIXA - VERSÃO COMPLETA E DETALHADA (Koda + FactionFlow)
const baseKnowledge = [
    // --- CONHECIMENTO GERAL ---
    { 
        topic: "Visão Geral e Diferenças dos Bots", 
        keywords: ["qual a diferença", "vc aprende?","posso adicionar memoria em vc?", "memoria", "Koda ou factionflow", "qual usar", "ajuda", "comandos", "bots"], 
        content: `Eu sou um assistente com conhecimento sobre dois bots distintos: o **Koda** e o **FactionFlow**.\n\n- **Koda** é um bot de gestão geral para servidores, com módulos como Bate-Ponto, Tickets de Suporte, Registros (Whitelist), Ausências, Uniformes e um poderoso sistema de Moderação. É ideal para a administração diária da comunidade.\n\n- **FactionFlow** é um bot especializado para servidores de RP com foco em facções. Ele gerencia arsenal, finanças, membros, hierarquia, recrutamento, operações, parcerias e muito mais, tudo de forma automatizada para as organizações.\n\nQuando tiver uma dúvida sobre uma função, por favor, especifique sobre qual bot você quer saber para que eu possa te ajudar melhor!` 
    },
    {
    topic: "[Koda] Módulo de Loja (StoreFlow)",
    keywords: ["Koda loja", "storeflow", "vender", "produtos", "comprar", "carrinho", "pagamento", "mercado pago", "pix", "cupom"],
    content: `O **StoreFlow** é um módulo de loja completo integrado ao Koda, permitindo que os servidores criem um sistema de e-commerce robusto.\n\n**Para Administradores (Grátis):**\n- **Gestão de Produtos:** Crie produtos com nome, preço, descrição e defina se o estoque é infinito ('GHOST') ou limitado ('REAL').\n- **Vitrine de Produtos:** Publique uma vitrine interativa onde os membros podem selecionar múltiplos itens para adicionar ao carrinho.\n- **Pagamento Manual:** Configure uma chave PIX para que os membros possam pagar e enviar o comprovativo num canal privado, aguardando a aprovação da staff.\n- **Gestão de Cupons:** Crie e gira cupons de desconto para as suas vendas.\n\n**Recursos Premium (Exclusivos):**\n- **Automação com Mercado Pago:** Integre sua conta para gerar pagamentos PIX automáticos. O bot verifica o pagamento e entrega os produtos instantaneamente, 24/7.\n- **Dashboard de Analytics:** Acompanhe o desempenho da sua loja com dados sobre faturamento, produtos mais vendidos e muito mais.\n- **Personalização Visual:** Altere a cor, título, descrição e imagem da sua vitrine.\n- **Monitor de Inatividade:** Configure o bot para fechar automaticamente carrinhos abandonados após um certo tempo.`
},
{
    topic: "[Koda] Módulo de Sugestões",
    keywords: ["Koda sugestões", "sugestão", "ideia", "feedback", "votar", "comunidade", "aprovar sugestão"],
    content: `O sistema de Sugestões do Koda é uma ferramenta completa e gratuita para gerir o feedback da sua comunidade.\n\n**Como funciona para os Membros:**\n1.  Clicam no botão "Fazer uma Sugestão" na vitrine.\n2.  Preenchem um formulário com o título e a descrição da ideia.\n3.  A sugestão é publicada num canal, onde todos podem votar com 👍 (Upvote) ou 👎 (Downvote).\n4.  Qualquer membro pode iniciar uma **thread de discussão** para debater a ideia sem poluir o canal principal.\n\n**Como funciona para a Staff:**\n- A staff pode gerir o ciclo de vida da sugestão com botões para **Aprovar**, **Negar** ou colocar **Em Análise**.\n- Todas as ações são registadas num canal de logs para total transparência.\n- Os administradores podem configurar o canal de envio, o cargo da staff, um cooldown para evitar spam e se o bot deve ou não mencionar @everyone a cada nova sugestão.`
},
{
    topic: "O Criador do Koda",
    keywords: ["quem te criou", "desenvolvedor", "criador", "zepiqueno", "zé pequeno", "factionflow", "policeflow"],
    content: `Fui desenvolvido pelo brilhante **ZÉPIQUENO**, um talentoso desenvolvedor Full Stack e especialista em NodeJS. Ele é a mente por trás não só de mim, o **Koda**, mas também de outros projetos incríveis como o **FactionFlow** e o **PoliceFlow**, que revolucionam a gestão de comunidades e servidores de RP. A sua visão e expertise são a base de toda a minha inteligência e funcionalidade.`
},

    // ===============================================================================================
    // ================================ CONHECIMENTO DO Koda ====================================
    // ===============================================================================================
    { 
        topic: "[Koda] Sistema Premium e Ativação", 
        keywords: ["Koda premium", "ativar Koda", "key Koda", "licença Koda", "comprar"], 
        content: `O Premium do Koda é ativado com uma chave de licença (key/cupom) e desbloqueia funcionalidades avançadas.\n\n**Para ativar sua chave no Koda:**\n1. Use o comando \`/configurar\`.\n2. No menu principal, clique no botão verde **"Ativar Key"**.\n3. Cole sua chave na janela que aparecer e envie.\n\n**Funcionalidades Premium do Koda:** Módulo de Moderação completo (Punições Personalizadas, Painel de Sanções Ativas), Guardian AI (IA de moderação e chat), Estatísticas detalhadas, customização de visuais, e recursos avançados para Tickets e Bate-Ponto.` 
    },
    { 
        topic: "[Koda] Sistema de Tickets", 
        keywords: ["Koda ticket", "Koda suporte", "atendimento"], 
        content: `O sistema de tickets do Koda agiliza o suporte no servidor.\n\n**Para Usuários:**\n1. Procure o painel "Central de Atendimento" e clique em **"Abrir Ticket"**.\n2. Se houver departamentos (Premium), selecione a área do problema.\n3. Um canal privado será criado para você e a equipe de suporte.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Tickets"**.\n2. Configure a **Categoria** dos tickets, o **Cargo de Suporte** e o **Canal de Logs**.\n3. Use **"Publicar Painel"** para criar o painel de abertura de tickets. Em "Config. Premium", você pode ativar Departamentos, Mensagens de Saudação, Auto-Fechamento, Avaliações e o Assistente de IA.` 
    },
    { 
        topic: "[Koda] Sistema de Bate-Ponto", 
        keywords: ["Koda ponto", "bater ponto", "serviço"], 
        content: `O Bate-Ponto do Koda registra o tempo de serviço dos membros.\n\n**Para Usuários:**\n1. No painel de Bate-Ponto, clique em **"Iniciar Serviço"**.\n2. Você receberá um painel em sua DM para **"Pausar"**, **"Retomar"** e **"Finalizar"** o serviço.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Bate-Ponto"**.\n2. Defina o **Canal de Logs** e o **Cargo em Serviço**.\n3. Ative e publique o painel. Em "Config. Premium", você pode ativar a verificação de inatividade (AFK).` 
    },
    { 
        topic: "[Koda] Sistema de Registros (Whitelist)", 
        keywords: ["Koda registro", "whitelist", "aprovar"], 
        content: `Este módulo do Koda automatiza a entrada de novos membros.\n\n**Para Usuários:**\n1. No painel de "Sistema de Registro", clique em **"Iniciar Registro"**.\n2. Preencha o formulário com seu **Nome no RP** e **ID no servidor RP**.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Registros"**.\n2. Configure o **Canal de Aprovações**, o **Cargo de Aprovado** e o **Canal de Logs**.` 
    },
    { 
        topic: "[Koda] Módulo de Moderação", 
        keywords: ["Koda moderação", "dossiê", "histórico", "notas", "punir", "banir", "kickar", "silenciar", "punições personalizadas", "revogar"], 
        content: `As ferramentas de moderação do Koda centralizam as ações da equipe.\n\n**Para a Staff:**\n- **Comandos:** Use \`/ban\`, \`/kick\`, \`/timeout\` e \`/warn\` para punições rápidas.\n- **Dossiê:** Clique com o botão direito em um usuário e vá em "Apps > Ver Dossiê" para ver o histórico completo de punições, adicionar notas internas ou gerenciar o histórico (remover ocorrências ou resetar).\n\n**Recursos Premium:**\n- **Punições Personalizadas:** Crie modelos de punição (ex: "Mute Leve" com 30min) para padronizar as ações.\n- **Punições Ativas:** Visualize e revogue todos os mutes e bans temporários que ainda estão ativos.\n- **Monitor de Expiração:** O bot remove automaticamente as punições quando o tempo delas acaba.` 
    },
    { 
        topic: "[Koda] Guardian AI", 
        keywords: ["Koda guardian", "ia", "moderação automática", "chat por menção"], 
        content: `O Guardian AI do Koda é um sistema de moderação e interação (Premium).\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Guardian AI"**.\n2. **Chat com IA por Menção:** Ative para que o bot converse com os membros quando for mencionado.\n3. **Moderação Automática:** Em "Sistema de Regras", crie "Políticas" para infrações como toxicidade ou spam, com "Passos" de punição que escalonam conforme a reincidência do usuário.` 
    },
    {
        topic: "[Koda] Sistema de Tags por Cargo (RoleTags)",
        keywords: ["Koda roletags", "tags", "tag", "apelido", "nickname", "sincronizar"],
        content: `Este sistema do Koda adiciona um prefixo (tag) ao apelido dos membros com base no cargo mais alto que eles possuem.\n\n**Para Administradores:**\n1. No \`/configurar\`, abra o menu **"Tags por Cargo"**.\n2. Clique em **"Adicionar / Editar"** para associar uma tag (ex: "[ADM]") a um cargo (ex: "Administrador").\n3. Para aplicar as tags a todos os membros de uma vez, use **"Sincronizar Todos"**.`
    },
    {
        topic: "[Koda] Estatísticas",
        keywords: ["Koda estatísticas", "stats", "gráficos", "análise"],
        content: "O módulo de Estatísticas (Premium) do Koda gera gráficos e dados sobre a atividade do servidor, como contagem de membros, mensagens trocadas, tickets abertos e registros de ponto. Ele pode ser acessado pelo menu principal do `/configurar`."
    },

    // ===============================================================================================
    // =============================== CONHECIMENTO DO FACTIONFLOW ===================================
    // ===============================================================================================
    { 
        topic: "[FactionFlow] Visão Geral e Comandos", 
        keywords: ["factionflow", "o que é factionflow", "facção", "facções", "rpainel", "setup-modulos"], 
        content: `O **FactionFlow** é um bot completo para gerenciamento de facções em servidores de RP. Ele automatiza arsenal, finanças, membros, hierarquia, recrutamento e operações através de painéis interativos.\n\n**Comandos Principais:**\n- \`/setup-modulos\`: Comando do Dono do servidor para ativar e configurar os módulos que as facções poderão usar.\n- \`/rpainel\`: Comando do Líder da facção para acessar o painel de controle de sua organização.`
    },
    { 
        topic: "[FactionFlow] Sistema de Hierarquia", 
        keywords: ["factionflow hierarquia", "cargos", "promover", "rebaixar"], 
        content: `O sistema de Hierarquia do FactionFlow exibe a estrutura de cargos da facção.\n\n**Para Líderes:**\n1. No \`/rpainel\`, clique em **"Hierarquia"**.\n2. Defina o canal de exibição e os cargos que compõem a hierarquia.\n3. Ao **"Publicar"**, o bot cria um painel que se atualiza sozinho quando membros são promovidos ou rebaixados, mostrando a contagem em cada cargo.`
    },
    { 
        topic: "[FactionFlow] Sistema de Recrutamento", 
        keywords: ["factionflow recrutamento", "recrutar", "aceitar"], 
        content: `O sistema de Recrutamento do FactionFlow gerencia a entrada de novos membros.\n\n**Para Candidatos:**\n1. No painel de registro, clique em **"Iniciar Registro"** e preencha o formulário.\n\n**Para Líderes:**\n1. Fichas chegam no canal de administração.\n2. Ao **"Aprovar"** um candidato, o bot automaticamente atribui os cargos e atualiza a tag no apelido.\n3. Em **"Recrutadores"** no \`/rpainel\`, você pode ver um ranking de quem mais recrutou.`
    },
    {
        topic: "[FactionFlow] Arsenal e Finanças",
        keywords: ["factionflow arsenal", "vendas", "armas", "estoque", "finanças", "caixa"],
        content: `O Arsenal do FactionFlow gerencia vendas, estoque e o caixa da facção.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Arsenal / Vendas"**.\n2. **Itens:** Cadastre, edite ou remova itens, definindo nome, preço, estoque e imagem.\n3. **Registrar Venda:** Selecione o item, a quantidade e confirme. O bot calcula o valor, dá baixa no estoque e registra no caixa.\n4. **Finanças:** O sistema controla o caixa, permitindo registrar vendas e também **Investimentos** (como compra de mais itens), que abatem o valor do caixa.`
    },
    {
        topic: "[FactionFlow] Sistema de Justiça",
        keywords: ["factionflow justiça", "processos", "advogado", "juiz", "multa", "prisão", "dossiê"],
        content: `O módulo de Justiça do FactionFlow organiza os processos legais do servidor.\n\n**Para Advogados/Juízes:**\n1. Use o comando \`/justica\` para abrir o painel.\n2. **Registrar Punição:** Inicie um processo, selecionando o usuário, o crime, provas e a punição (multa ou prisão).\n3. **Histórico:** Todas as punições ficam salvas no "dossiê" do cidadão, que pode ser consultado a qualquer momento.\n\n**Para Administradores:**\n- No \`/setup-modulos\`, configure os cargos de advogado, canal de logs e as regras/crimes com punições padrão.`
    },
    {
        topic: "[FactionFlow] Operações (OPs)",
        keywords: ["factionflow operações", "ops", "agendar"],
        content: `O sistema de Operações (OPs) do FactionFlow organiza missões e eventos da facção.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Operações"**.\n2. Você pode **"Agendar Operação"**, definindo nome, data, hora e descrição.\n3. O bot cria um anúncio com botões para os membros **"Participar"** ou **"Sair"**. O painel mostra a lista de participantes em tempo real.`
    },
    {
        topic: "[FactionFlow] Parcerias",
        keywords: ["factionflow parcerias", "aliados", "parceiros"],
        content: `O módulo de Parcerias do FactionFlow permite exibir e gerenciar as facções aliadas.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Parcerias"**.\n2. Você pode adicionar, editar ou remover parceiros, incluindo nome, descrição e link do Discord.\n3. Ao **"Publicar"**, o bot cria um painel elegante listando todas as parcerias, que pode ser exibido em um canal público.`
    },
    {
        topic: "[FactionFlow] Limpeza de Membros (Prune)",
        keywords: ["factionflow prune", "limpeza", "inativos", "remover membros"],
        content: `O módulo de Limpeza de Membros (Prune) do FactionFlow ajuda a remover membros inativos do servidor.\n\n**Para Administradores:**\n1. No \`/setup-modulos\`, vá em **"Limpeza de Membros"**.\n2. Você pode definir um **Cargo de Imunidade** (ex: "VIP") que protege os membros de serem removidos.\n3. Ao iniciar uma varredura, o bot lista todos os membros inativos (que não entram há um período de tempo) e permite removê-los com um clique.`
    },
    {
        topic: "[FactionFlow] Sentinela (Relatórios Automáticos)",
        keywords: ["factionflow sentinela", "relatórios", "automático"],
        content: `O Sentinela do FactionFlow é um sistema de relatórios automáticos.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Sentinela"**.\n2. Você pode agendar o envio de relatórios diários ou semanais sobre as atividades da facção (vendas, recrutamentos, etc.) para um canal específico, mantendo a liderança sempre informada.`
    },
    {
        topic: "[FactionFlow] Changelog",
        keywords: ["factionflow changelog", "atualizações", "novidades"],
        content: `O módulo de Changelog do FactionFlow é usado para comunicar atualizações do servidor ou da facção.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Changelog"**.\n2. Adicione, edite ou remova entradas de atualização.\n3. Ao **"Publicar"**, o bot envia um embed formatado para o canal de novidades, com um sistema de paginação para ver atualizações antigas.`
    },
    {
        topic: "[FactionFlow] Sorteios (Giveaway)",
        keywords: ["factionflow sorteio", "giveaway", "prêmios"],
        content: `O módulo de Sorteios do FactionFlow permite criar sorteios de forma fácil e profissional.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Sorteios"**.\n2. Crie um novo sorteio definindo o prêmio, duração e número de ganhadores.\n3. O bot publica um painel onde os membros podem entrar clicando em um botão. Ao final, o bot sorteia e anuncia os vencedores automaticamente.`
    },
    {
        topic: "[FactionFlow] Controle de Acesso por Senha",
        keywords: ["factionflow senha", "acesso", "proteger", "password"],
        content: `O FactionFlow permite proteger módulos sensíveis com uma senha.\n\n**Para Líderes:**\n1. No \`/rpainel\`, vá em **"Controle de Acesso"**.\n2. Selecione um módulo (ex: "Arsenal / Vendas") e defina uma senha.\n3. A partir de então, qualquer membro que tentar acessar aquele painel precisará digitar a senha correta primeiro.`
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