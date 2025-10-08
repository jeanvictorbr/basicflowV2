// handlers/buttons/mod_dossie_remove_log.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'mod_dossie_remove_log_',
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[4];
        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetId, interaction.guild.id])).rows;

        const options = history.slice(0, 25).map(log => ({
            label: `[${log.action}] em ${new Date(log.created_at).toLocaleDateString()}`,
            description: `Motivo: ${log.reason.substring(0, 50)}`,
            value: log.case_id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_mod_dossie_remove_log_${targetId}`)
            .setPlaceholder('Selecione a ocorrência a ser removida')
            .addOptions(options);
        
        await interaction.reply({
            content: 'Selecione a ocorrência do histórico que deseja apagar permanentemente.',
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            ephemeral: true
        });
    }
};