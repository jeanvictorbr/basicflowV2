// handlers/buttons/dev_key_history_clear_all_confirm.js
const db = require('../../database.js');
const generateDevKeyHistoryMenu = require('../../ui/devPanel/devKeyHistoryMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_history_clear_all_confirm',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        // Apaga todos os registros da tabela de histórico
        await db.query('DELETE FROM key_activation_history');

        // Mostra o menu de histórico agora vazio
        await interaction.editReply({
            components: generateDevKeyHistoryMenu([], 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await interaction.followUp({ content: '✅ Histórico de ativação de chaves foi completamente limpo.', ephemeral: true });
    }
};