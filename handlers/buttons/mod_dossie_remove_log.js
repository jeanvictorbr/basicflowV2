// handlers/buttons/mod_dossie_remove_log.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

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

        const cancelButton = new ButtonBuilder()
            .setCustomId(`mod_dossie_manage_back_${targetId}`)
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: "### 📋 Remoção de Ocorrência" },
                    { type: 10, content: "> Selecione no menu abaixo qual ocorrência do histórico você deseja apagar permanentemente." }
                ]},
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};