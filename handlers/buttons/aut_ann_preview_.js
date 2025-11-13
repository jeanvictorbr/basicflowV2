// Substitua o conteúdo em: handlers/buttons/aut_ann_preview_.js
const db = require('../../database');
// CORREÇÃO: Importar V2_FLAG também
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_ann_preview_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        try {
            // Busca o JSON V2 pronto do banco
            const { rows } = await db.query('SELECT content_v2 FROM automations_announcements WHERE announcement_id = $1 AND guild_id = $2', [annId, interaction.guild.id]);
            
            if (rows.length === 0) {
                return interaction.reply({
                    content: '❌ Anúncio não encontrado.',
                    flags: EPHEMERAL_FLAG
                });
            }

            let payload = rows[0].content_v2;
            
            // --- CORREÇÃO ---
            // 1. Pega as flags atuais ou 0
            let currentFlags = payload.flags || 0;
            
            // 2. Adiciona a flag efêmera para o preview
            currentFlags |= EPHEMERAL_FLAG;

            // 3. Garante que a V2_FLAG seja REMOVIDA
            // O preview é uma mensagem com embed, não uma UI V2 (type: 17)
            // Isso previne o erro 50035 mesmo se dados antigos no DB tiverem a flag
            currentFlags &= ~V2_FLAG; 

            // 4. Define as flags corrigidas
            payload.flags = currentFlags;
            // --- FIM DA CORREÇÃO ---

            // Envia o payload V2 diretamente
            await interaction.reply(payload);

        } catch (err) {
            console.error('Erro ao pré-visualizar anúncio:', err);
            await interaction.reply({
                content: '❌ Ocorreu um erro ao tentar pré-visualizar este anúncio.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};