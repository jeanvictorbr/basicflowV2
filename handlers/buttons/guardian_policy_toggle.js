const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');
module.exports = {
    customId: 'guardian_policy_toggle',
    async execute(interaction) {
        const policies = (await db.query('SELECT id, name, is_enabled FROM guardian_policies WHERE guild_id = $1', [interaction.guild.id])).rows;
        if (policies.length === 0) return interaction.reply({ content: 'Não há políticas para gerenciar.', ephemeral: true });
        const options = policies.map(p => ({ label: p.name, value: String(p.id), emoji: p.is_enabled ? '🟢' : '🔴' }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_guardian_policy_toggle').setPlaceholder('Selecione uma política para ativar/desativar').addOptions(options);
        await interaction.reply({ components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
    }
};