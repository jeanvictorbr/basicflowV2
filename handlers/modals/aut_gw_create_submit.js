const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

// Simples parser de duração
function parseDuration(str) {
    const match = str.match(/(\d+)([mhd])/);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'm') return val * 60 * 1000;
    if (unit === 'h') return val * 60 * 60 * 1000;
    if (unit === 'd') return val * 24 * 60 * 60 * 1000;
    return null;
}

module.exports = {
    customId: 'aut_gw_create_submit',
    async execute(interaction) {
        const prize = interaction.fields.getTextInputValue('gw_prize');
        const durationStr = interaction.fields.getTextInputValue('gw_duration');
        const winners = parseInt(interaction.fields.getTextInputValue('gw_winners')) || 1;
        const desc = interaction.fields.getTextInputValue('gw_desc') || '';

        const durationMs = parseDuration(durationStr);
        if (!durationMs) return interaction.reply({ content: '❌ Formato de tempo inválido. Use 10m, 1h, 1d.', ephemeral: true });

        const db = require('../../database');
        
        // CORREÇÃO: Nome da tabela alterado para automations_giveaways
        const res = await db.query(
            "INSERT INTO automations_giveaways (message_id, guild_id, channel_id, host_id, prize, description, winner_count, end_timestamp, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft') RETURNING message_id",
            [`draft_${interaction.id}`, interaction.guild.id, 'pending', interaction.user.id, prize, desc, winners, Date.now() + durationMs]
        );
        
        const draftId = res.rows[0].message_id;

        // Interface de Configuração Final (Draft)
        const configLayout = {
            type: 17,
            components: [
                { type: 10, content: `## ⚙️ Configurando Sorteio: ${prize}\n**Duração:** ${durationStr}\n**Vencedores:** ${winners}\n\nSelecione onde enviar e configurações extras abaixo.` },
                { type: 14, divider: true, spacing: 2 },
                { 
                    type: 1, 
                    components: [{
                        type: 8, // Channel Select
                        custom_id: `aut_gw_draft_channel_${draftId}`,
                        channel_types: [0], // Text Channels
                        placeholder: "Selecione o canal para postar..."
                    }]
                },
                { type: 14, divider: true, spacing: 1 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 3, label: "Publicar Agora", emoji: { name: "🚀" }, custom_id: `aut_gw_publish_${draftId}`, disabled: true }, 
                        { type: 2, style: 4, label: "Cancelar", emoji: { name: "🗑️" }, custom_id: `aut_gw_cancel_${draftId}` }
                    ]
                }
            ]
        };

        await interaction.reply({ components: [configLayout], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};