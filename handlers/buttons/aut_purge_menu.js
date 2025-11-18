// Local: handlers/buttons/aut_purge_menu.js
const { getPurgeMenu } = require('../../ui/automations/purgeMenu');
const db = require('../../database'); // <--- IMPORTAÇÃO ADICIONADA

module.exports = {
    customId: 'aut_purge_menu',
    async execute(interaction) {
        // Buscar configurações existentes para este servidor
        const result = await db.query(
            'SELECT * FROM guild_aut_purge WHERE guild_id = $1 ORDER BY channel_id',
            [interaction.guild.id]
        );

        const payload = getPurgeMenu(result.rows);
        
        // Se for uma atualização de mensagem (clique em botão) ou nova resposta
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // Tenta atualizar, se falhar (ex: mensagem muito antiga), envia nova
            try {
                await interaction.update(payload);
            } catch (e) {
                await interaction.reply(payload);
            }
        } else {
            await interaction.reply(payload);
        }
    },
};