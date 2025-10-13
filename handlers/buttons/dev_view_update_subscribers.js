// handlers/buttons/dev_view_update_subscribers.js
const db = require('../../database');

const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_view_update_subscribers',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        const result = await db.query('SELECT guild_id FROM guild_settings WHERE updates_channel_id IS NOT NULL AND updates_channel_id <> \'\'');
        if (result.rows.length === 0) {
            return interaction.editReply({ content: 'Nenhum servidor configurou o canal de atualizações ainda.' });
        }

        const guildIds = result.rows.map(row => row.guild_id);
        let description = '';

        for (const id of guildIds) {
            try {
                const guild = await interaction.client.guilds.fetch(id);
                description += `- **${guild.name}** (\`${id}\`)\n`;
            } catch {
                description += `- *Servidor Desconhecido* (\`${id}\`)\n`;
            }
        }
        
        const embed = {
            "title": "📢 Servidores com Canal de Atualizações Ativo",
            "description": description,
            "color": 0x5865F2,
            "footer": { "text": `Total: ${guildIds.length} servidores.` }
        };

        await interaction.editReply({ embeds: [embed] });
    }
};