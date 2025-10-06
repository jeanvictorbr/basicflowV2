// Crie em: handlers/buttons/ponto_load_vitrine.js
const db = require('../../database.js');
const generatePontoPainel = require('../../ui/pontoPainel.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'ponto_load_vitrine',
    async execute(interaction) {
        // Garante que apenas administradores possam carregar o painel
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Você não tem permissão para carregar este painel.', ephemeral: true });
        }
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const painelPayload = generatePontoPainel(settings || {});

        // A MÁGICA: Substitui a mensagem do botão pelo painel V2, usando a flag correta.
        await interaction.update({
            content: null, // Limpa o texto "Clique no botão..."
            components: painelPayload,
            flags: V2_FLAG
        });
    }
};