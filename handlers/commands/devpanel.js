// handlers/commands/devpanel.js
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'devpanel',
    async execute(interaction) {
        // Trava o comando apenas para o seu ID de usuário
        if (interaction.user.id !== process.env.DEV_USER_ID) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }
        
        await interaction.reply({
            components: generateDevMainMenu(),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};