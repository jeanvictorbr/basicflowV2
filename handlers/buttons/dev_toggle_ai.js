// Crie em: handlers/buttons/dev_toggle_ai.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_toggle_ai',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        // Garante que a linha de status existe, inserindo o valor padrão (true) se não existir
        await db.query("INSERT INTO bot_status (status_key, ai_services_enabled) VALUES ('main', true) ON CONFLICT (status_key) DO NOTHING");
        
        // Inverte o valor booleano atual no banco de dados
        await db.query("UPDATE bot_status SET ai_services_enabled = NOT ai_services_enabled WHERE status_key = 'main'");

        // Busca o novo status para atualizar a interface
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];

        // Gera e exibe o menu atualizado
        await interaction.editReply({
            components: generateDevMainMenu(botStatus),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};