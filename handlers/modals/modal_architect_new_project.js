// Substitua completamente o conteúdo deste arquivo

const { getAIResponse } = require('../../utils/aiAssistant.js');
const db = require('../../database.js');
const generateBlueprintDisplay = require('../../ui/guildArchitect/blueprintDisplay.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_architect_new_project',
    async execute(interaction) {
        await interaction.deferUpdate();

        const serverDescription = interaction.fields.getTextInputValue('architect_description');
        const sessionId = interaction.channelId;

        await interaction.editReply({
            content: '🤖 Entendido. Estou consultando a IA e desenhando a planta baixa do seu servidor... Isso pode levar até um minuto.',
            components: [],
            embeds: [],
            flags: EPHEMERAL_FLAG
        });

        // --- INÍCIO DA CORREÇÃO: PROMPT MELHORADO ---
        const systemPrompt = `Sua tarefa é criar um blueprint em JSON para um servidor Discord baseado na descrição do usuário. A resposta DEVE ser APENAS o JSON puro, sem nenhum texto, markdown ou explicação extra.

A estrutura do JSON deve ser:
{
  "categories": [
    {
      "name": "NOME DA CATEGORIA",
      "channels": [ { "name": "nome-do-canal-de-texto", "type": "text" }, { "name": "Nome do Canal de Voz", "type": "voice" } ]
    }
  ],
  "roles": [ { "name": "Nome Do Cargo" } ]
}

### EXEMPLO DE INTERAÇÃO ###
DESCRIÇÃO DO USUÁRIO: "Um servidor para um time de Valorant, com geral, táticas e um canal de voz para jogos."
SUA RESPOSTA JSON:
{
  "categories": [
    {
      "name": "🚀 INÍCIO",
      "channels": [
        { "name": "💬-geral", "type": "text" },
        { "name": "🎯-taticas", "type": "text" }
      ]
    },
    {
      "name": "🔊 JOGATINA",
      "channels": [
        { "name": "🎮 Duo", "type": "voice" },
        { "name": "🎮 Trio", "type": "voice" },
        { "name": "🎮 Squad", "type": "voice" }
      ]
    }
  ],
  "roles": [
    { "name": "Membro" },
    { "name": "Capitão" }
  ]
}
### FIM DO EXEMPLO ###

Agora, gere o blueprint JSON para a seguinte descrição:`;
        // --- FIM DA CORREÇÃO ---

        try {
            const aiResponse = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: 'Arquiteto - Geração de Blueprint',
                userMessage: serverDescription,
                customPrompt: systemPrompt,
                useBaseKnowledge: false
            });
            
            // Adicionado para depuração: veja nos logs do bot o que a IA respondeu
            console.log('[Arquiteto] Resposta Bruta da IA:', aiResponse);

            let blueprint;
            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("Nenhum bloco JSON válido encontrado na resposta da IA.");
                }
                blueprint = JSON.parse(jsonMatch[0]);

            } catch (e) {
                console.error('[Arquiteto] Erro ao fazer parse do JSON da IA:', e, '\nResposta completa da IA:', aiResponse);
                await interaction.followUp({ content: '❌ A IA retornou um formato inválido. Não foi possível ler o plano. Por favor, tente novamente.', flags: EPHEMERAL_FLAG });
                return;
            }

            await db.query(
                'UPDATE architect_sessions SET blueprint = $1 WHERE channel_id = $2',
                [JSON.stringify(blueprint), sessionId]
            );

            const { embeds, components } = generateBlueprintDisplay(blueprint, sessionId);

            await interaction.editReply({
                content: '',
                embeds: embeds,
                components: components,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('[Arquiteto] Erro ao gerar blueprint:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro crítico ao comunicar com a IA. Tente novamente mais tarde.', flags: EPHEMERAL_FLAG });
        }
    }
};