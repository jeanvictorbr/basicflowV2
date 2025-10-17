// handlers/buttons/dev_view_error_log.js
const fs = require('fs');
const path = require('path');
const generateErrorLogViewer = require('../../ui/devPanel/devErrorLogViewer');

// O nome do arquivo de log. Altere se o seu tiver outro nome.
const LOG_FILE_NAME = 'error.log'; 
const LOG_FILE_PATH = path.join(__dirname, '..', '..', LOG_FILE_NAME);

module.exports = {
    customId: 'dev_view_error_log',
    async execute(interaction) {
        await interaction.deferUpdate();

        let logContent = 'Não foi possível ler o arquivo de log ou ele está vazio.';
        const NUM_LINES = 15;

        try {
            if (fs.existsSync(LOG_FILE_PATH)) {
                const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
                const lines = data.trim().split('\n');
                const lastLines = lines.slice(-NUM_LINES);
                if (lastLines.length > 0) {
                    logContent = lastLines.join('\n');
                }
            } else {
                logContent = `Arquivo de log (${LOG_FILE_NAME}) não encontrado na raiz do projeto.`;
            }
        } catch (error) {
            console.error('Erro ao ler arquivo de log:', error);
            logContent = 'Ocorreu um erro ao tentar ler o arquivo de log.';
        }

        await interaction.editReply(generateErrorLogViewer(logContent, NUM_LINES));
    }
};