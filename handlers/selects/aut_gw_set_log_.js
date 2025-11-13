// handlers/selects/aut_gw_set_log_.js
const db = require('../../database');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_set_log_',
    async execute(interaction) {
        const channelId = interaction.values[0];
        
        // Atualiza o canal de logs no banco de dados
        await db.query("UPDATE guild_settings SET giveaway_log_channel_id = $1 WHERE guild_id = $2", [channelId, interaction.guild.id]);

        // CORREÇÃO: Removemos 'content' e colocamos o texto dentro de um componente Type 10
        await interaction.update({
            components: [
                {
                    type: 17,
                    accent_color: 5763719, // Verde (Sucesso)
                    components: [
                        { 
                            type: 10, 
                            content: `## ✅ Configuração Salva!\nO canal de logs de sorteios foi definido para <#${channelId}> com sucesso.` 
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 2,
                                    label: "Voltar",
                                    custom_id: "aut_gw_menu"
                                }
                            ]
                        }
                    ]
                }
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};