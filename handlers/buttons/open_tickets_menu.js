const { ticketsMenuEmbed } = require('../../ui/ticketsMenu.js'); // Usando o arquivo que você já tem

module.exports = {
    customId: 'open_tickets_menu',
    async execute(interaction) {
        // O seu ticketsMenu.js já exporta o formato correto
        await interaction.update(ticketsMenuEmbed);
    }
};