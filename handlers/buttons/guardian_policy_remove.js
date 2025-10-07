const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');
module.exports = {
    customId: 'guardian_policy_remove',
    async execute(interaction) {
        const policies = (await db.query('SELECT id, name FROM guardian_policies WHERE guild_id = $1', [interaction.guild.id])).rows;
        if (policies.length === 0) return interaction.reply({ content: 'Não há políticas para remover.', ephemeral: true });
        const options = policies.map(p => ({ label: p.name, value: String(p.id) }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_guardian_policy_remove').setPlaceholder('Selecione uma política para remover').addOptions(options);
        await interaction.reply({ content: 'Selecione a política que deseja remover. **Atenção: Isso removerá todos os passos associados a ela.**', components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
    }
};