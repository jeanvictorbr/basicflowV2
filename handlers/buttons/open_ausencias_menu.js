// handlers/buttons/open_ausencias_menu.js
const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

module.exports = {
    customId: 'open_ausencias_menu',
    async execute(interaction) {
        try {
            // Busca as configurações atuais do servidor no banco de dados
            const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
            const settings = settingsResult.rows[0] || {};

            // Gera o menu de ausências com as configurações encontradas
            const ausenciasMenuComponents = generateAusenciasMenu(settings);

            // Atualiza a mensagem original com o menu de ausências
            await interaction.update({ components: ausenciasMenuComponents, embeds: [], content: null });

        } catch (error) {
            console.error('Erro ao abrir o menu de ausências:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Ocorreu um erro ao buscar as configurações de ausência.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Ocorreu um erro ao buscar as configurações de ausência.', ephemeral: true });
            }
        }
    }
};