// utils/aiKnowledgeBase.js

// Esta é a memória expansível do Assistente de IA.
// Para ensinar algo novo à IA, basta adicionar um novo objeto a este array.
// Use `keywords` para ajudar o motor de busca a encontrar o tópico certo.

const knowledgeBase = [
    {
        topic: "Visão Geral do BasicFlow",
        keywords: ["basicflow", "bot", "o que é", "funciona", "funções", "geral"],
        content: `O BasicFlow é um bot multifuncional para Discord focado em servidores de FiveM, desenvolvido por "ze pqueno". Ele possui sistemas modulares para automatizar e gerir as principais operações de um servidor, como tickets, bate-ponto, registros de novos membros, ausências e uniformes. Existem funcionalidades básicas e funcionalidades Premium que requerem uma chave de ativação.`
    },
    {
        topic: "Sistema de Bate-Ponto",
        keywords: ["ponto", "bater ponto", "serviço", "horas", "ranking", "pausar", "afk"],
        content: `O sistema de Bate-Ponto permite registar o tempo de serviço.
- Para começar, use o botão "Iniciar Serviço" no painel de ponto.
- Enquanto estiver em serviço, você receberá um cargo específico e um painel pessoal na sua DM para "Pausar" ou "Finalizar" o serviço.
- O tempo em pausa não é contabilizado.
- Existe uma verificação de inatividade (AFK) que pode ser ativada pelos administradores; se você não confirmar a sua atividade, o seu ponto será finalizado automaticamente.
- Todas as horas são registadas num ranking, que pode ser consultado no painel de ponto.`
    },
    {
        topic: "Sistema de Tickets e Suporte",
        keywords: ["ticket", "suporte", "ajuda", "atendimento", "departamento", "avaliação", "fechar ticket"],
        content: `O sistema de Tickets é a forma de obter ajuda da equipa.
- Para abrir um ticket, clique no botão "Abrir Ticket" no painel de atendimento.
- Se o servidor tiver Departamentos configurados (uma funcionalidade Premium), você poderá escolher a área específica para o seu problema (ex: Suporte Técnico, Denúncias).
- Após abrir o ticket, um canal privado será criado para você e para a equipa de suporte.
- A IA do BasicFlow dará a primeira resposta. Um membro da equipa humana irá assumir o caso assim que possível.
- Quando o seu problema for resolvido, o ticket será finalizado e você poderá receber um pedido na sua DM para avaliar o atendimento com 1 a 5 estrelas.`
    },
    {
        topic: "Sistema de Registros",
        keywords: ["registro", "registrar", "whitelist", "aprovar", "recusar", "ficha", "id rp"],
        content: `O sistema de Registros serve para que novos membros possam ser aprovados no servidor.
- Para se registrar, o utilizador deve clicar em "Iniciar Registro" na vitrine de registros.
- Ele preencherá um formulário com o seu Nome e ID no servidor de Roleplay (RP).
- A ficha será enviada para um canal de administração para ser avaliada.
- Se a ficha for aprovada, o bot automaticamente dará o cargo de "Aprovado" e alterará o apelido do membro no Discord para incluir a tag e o ID do RP.`
    },
    {
        topic: "Sistema de Ausências",
        keywords: ["ausência", "ausente", "férias", "afastado", "licença"],
        content: `O sistema de Ausências permite que os membros informem formalmente um período em que estarão inativos.
- Para solicitar uma ausência, o membro deve usar o botão "Solicitar Ausência" na vitrine de ausências.
- Ele preencherá um formulário com a data de início, data de término e o motivo.
- O pedido será enviado para a administração para ser aprovado.
- Se aprovado, o bot atribuirá o cargo de "Ausente" ao membro durante o período especificado.`
    },
    {
        topic: "Sistema de Uniformes",
        keywords: ["uniforme", "farda", "preset", "código", "roupa", "vestiário"],
        content: `O sistema de Uniformes funciona como um vestiário virtual.
- Existe um painel onde os membros podem selecionar um uniforme de uma lista.
- Ao selecionar um uniforme, o bot exibe a imagem do uniforme e um campo com o "Código do Preset".
- Este código pode ser copiado para ser usado dentro do jogo (FiveM).`
    },
    {
        topic: "Funcionalidades Premium",
        keywords: ["premium", "chave", "key", "vantagens", "pagar", "ativar"],
        content: `O BasicFlow possui funcionalidades Premium que são desbloqueadas ao ativar uma chave de licença no servidor. As principais vantagens Premium incluem:
- **Assistente com IA:** Um assistente de IA que responde e interage nos tickets.
- **Departamentos de Suporte:** Permite criar equipas de suporte separadas para cada tipo de problema.
- **Auto-Fechamento de Tickets:** Fecha automaticamente tickets que ficam inativos.
- **Sistema de Avaliações:** Permite que os utilizadores avaliem o atendimento recebido.
- **Personalização de Imagens:** Permite alterar as imagens padrão dos painéis e vitrines.`
    },
];

// Função que busca na base de conhecimento
function searchKnowledge(query) {
    if (!query) return '';

    const queryWords = query.toLowerCase().split(/\s+/);
    const foundTopics = new Set();

    knowledgeBase.forEach(item => {
        for (const keyword of item.keywords) {
            if (queryWords.some(word => keyword.includes(word))) {
                foundTopics.add(item.content);
                break; 
            }
        }
    });

    return Array.from(foundTopics).join('\n\n---\n\n');
}

module.exports = { searchKnowledge };