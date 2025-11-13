// handlers/buttons/aut_gw_publish_.js
const db = require('../../database');
const { getGiveawayComponents } = require('../../utils/giveawayManager');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_publish_',
    async execute(interaction) {
        // Defer update para evitar timeout enquanto processa
        await interaction.deferUpdate();

        const draftId = interaction.customId.split('_').slice(3).join('_') || interaction.customId.split('_').pop();
        
        // 1. Busca os dados do draft na tabela NOVA
        const gwResult = await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [draftId]);
        const gw = gwResult.rows[0];

        if(!gw) {
            return interaction.followUp({ content: '❌ Erro: Rascunho do sorteio não encontrado no banco de dados.', flags: EPHEMERAL_FLAG });
        }

        try {
            const channel = await interaction.guild.channels.fetch(gw.channel_id);
            
            // 2. Recalcula o tempo de término para começar AGORA
            // (gw.end_timestamp original era baseado no momento de criação do draft)
            const originalDuration = parseInt(gw.end_timestamp) - parseInt(gw.created_at.getTime());
            const newEndTime = Date.now() + originalDuration;

            // 3. Prepara o payload da mensagem pública
            // Usamos um ID temporário apenas para gerar o layout inicial
            const mockGw = { ...gw, status: 'active', end_timestamp: newEndTime, message_id: 'temp_id' };
            const payload = await getGiveawayComponents(mockGw, interaction.client);
            
            // 4. Envia a mensagem no canal
            const sentMsg = await channel.send(payload);

            // 5. Atualiza o Banco de Dados com o ID real da mensagem e o novo status
            // TABELA NOVA: automations_giveaways
            await db.query(
                "UPDATE automations_giveaways SET message_id = $1, end_timestamp = $2, status = 'active' WHERE message_id = $3",
                [sentMsg.id, newEndTime, draftId]
            );

            // 6. Atualiza a mensagem enviada para que os botões tenham o ID correto (agora que temos o ID da mensagem)
            // Isso é crucial para os botões funcionarem
            const finalPayload = await getGiveawayComponents({ ...mockGw, message_id: sentMsg.id }, interaction.client);
            await sentMsg.edit(finalPayload);

            // 7. Feedback final para o admin
            await interaction.editReply({
                content: "",
                components: [
                    {
                        type: 17,
                        accent_color: 5763719, // Verde
                        components: [
                            { type: 10, content: `## ✅ Sorteio Publicado!\nO sorteio foi enviado com sucesso para <#${gw.channel_id}>.` },
                            { type: 14, divider: true, spacing: 2 },
                            { type: 1, components: [{ type: 2, style: 2, label: "Voltar ao Menu", custom_id: "aut_gw_menu" }] }
                        ]
                    }
                ],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("[Giveaway Publish] Erro:", error);
            await interaction.followUp({ content: `❌ Erro ao publicar: ${error.message}`, flags: EPHEMERAL_FLAG });
        }
    }
};