// handlers/selects/aut_voice_save_cat.js
const db = require('../../database.js');
const getVoiceUI = require('../../ui/automations/voiceMain.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_voice_save_cat',
    async execute(interaction) {
        const categoryId = interaction.values[0];
        
        // 1. Verifica se o Hub já existe
        const exists = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        
        // --- TRAVA DE SEGURANÇA ---
        // Se não existir, impede a criação, pois o banco exige o Trigger Channel (Gatilho) primeiro.
        if (exists.rows.length === 0) {
            return interaction.update({ 
                content: '⚠️ **Ordem Incorreta:** O banco de dados exige que você configure o **Canal de Voz (Gatilho)** primeiro!\n\nPor favor, selecione o canal de voz no menu acima antes de definir a categoria.',
                components: [], // Limpa os componentes para forçar o reinício do fluxo correto
                flags: V2_FLAG 
            });
        }
        // ---------------------------

        // Se já existe, apenas atualiza a categoria
        await db.query('UPDATE voice_hubs SET category_id = $1 WHERE guild_id = $2', [categoryId, interaction.guild.id]);

        // Atualiza Painel Principal
        const res = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
        
        // Garante que temos dados para a UI
        if (res.rows.length > 0) {
            const ui = getVoiceUI(res.rows[0]);
            await interaction.update({ components: ui.components, flags: V2_FLAG });
        } else {
             await interaction.update({ content: "✅ Categoria salva.", components: [], flags: V2_FLAG });
        }
    }
};