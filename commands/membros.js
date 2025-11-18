// Local: handlers/commands/membros.js
const { getMembrosAdminHub } = require('../../ui/admin/membrosAdminHub');
const { getMembrosMenu } = require('../../ui/membros/mainMenu'); // O menu normal para usuários comuns
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = async (interaction) => {
    // Se for Desenvolvedor, mostra o Painel Admin
    if (process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
        const payload = await getMembrosAdminHub(interaction);
        return interaction.reply(payload);
    }
    
    // Se for usuário normal, mostra o menu normal (se existir)
    // Caso contrário, retorna erro ou menu padrão
    try {
        const payload = await getMembrosMenu(interaction); // Certifique-se que essa função existe
        return interaction.reply(payload);
    } catch (e) {
         return interaction.reply({ 
             content: "Você não tem permissão para acessar o painel de desenvolvedor.", 
             flags: EPHEMERAL_FLAG 
         });
    }
};