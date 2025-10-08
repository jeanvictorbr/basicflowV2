// handlers/buttons/open_tickets_menu.js
const db = require('../../database.js');
const generateTicketsMenu = require('../../ui/ticketsMenu.js');
const hasFeature = require('../../utils/featureCheck.js'); // Importa a função de verificação
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_tickets_menu',
    async execute(interaction) {
        // 1. Adia a resposta imediatamente para evitar o erro "Unknown Interaction"
        await interaction.deferUpdate();

        // Garante que a linha de configuração exista no banco de dados
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        // 2. Verifica se o servidor tem a feature premium de tickets
        const isPremium = await hasFeature(interaction.guild.id, 'TICKETS_PREMIUM');

        // 3. Gera o menu passando os argumentos corretos (settings, isPremium)
        const menu = generateTicketsMenu(settings, isPremium);

        // 4. Edita a resposta adiada com o conteúdo final
        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};