// handlers/buttons/aut_ann_delete_confirm_.js
const db = require('../../database');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    // Este customId deve bater com o gerado no arquivo acima
    customId: 'aut_ann_cfm_del_', 
    async execute(interaction) {
        
        // Extrai o ID (ex: aut_ann_cfm_del_15 -> 15)
        const annId = interaction.customId.split('_').pop();
        console.log(`[DEBUG] Tentando deletar anúncio ID: ${annId}`);

        try {
            // Executa a exclusão
            await db.query('DELETE FROM automations_announcements WHERE announcement_id = $1', [annId]);
            
            const successLayout = {
                type: 17,
                accent_color: 5763719, // Verde
                components: [
                    {
                        type: 10,
                        content: `## ✅ Anúncio Removido`
                    },
                    {
                        type: 10,
                        content: `O anúncio **ID: ${annId}** foi deletado do banco de dados com sucesso.`
                    },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2, 
                                style: 2, 
                                label: 'Voltar para Lista',
                                emoji: { name: '📜' },
                                custom_id: 'automations_manage_announcements'
                            }
                        ]
                    }
                ]
            };

            // Usa update() direto. É mais atômico e evita o "pisca" do deferUpdate mal gerenciado.
            await interaction.update({
                content: "", // Remove texto anterior se houver
                components: [successLayout],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (err) {
            console.error(`[ERRO] Falha ao deletar ID ${annId}:`, err);
            
            await interaction.update({
                content: `❌ **Erro ao deletar:** ${err.message}`,
                components: [], // Remove componentes quebrados
                flags: EPHEMERAL_FLAG
            });
        }
    }
};