// Local: handlers/commands/membros.js
const { getMembrosAdminHub } = require('../../ui/admin/membrosAdminHub');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = async (interaction) => {
    // Verificação de segurança extra
    if (!process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
        return interaction.reply({ 
            content: "❌ Apenas desenvolvedores podem acessar este painel.", 
            flags: EPHEMERAL_FLAG 
        });
    }

    try {
        // Chama a função que gera o painel
        const payload = await getMembrosAdminHub(interaction);
        return interaction.reply(payload);
    } catch (error) {
        console.error('Erro no comando membros:', error);
        return interaction.reply({ 
            content: "❌ Erro ao carregar o painel.", 
            flags: EPHEMERAL_FLAG 
        });
    }
};