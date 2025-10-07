// handlers/buttons/guardian_rule_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_rule_remove',
    async execute(interaction) {
        const rules = (await db.query('SELECT id, name FROM guardian_rules WHERE guild_id = $1', [interaction.guild.id])).rows;
        
        // --- CORREÇÃO DE SEGURANÇA APLICADA ---
        if (rules.length === 0) {
            await interaction.reply({ content: 'Não há regras para remover.', ephemeral: true });
            return;
        }

        const options = rules.map(r => ({ label: r.name, value: String(r.id), description: `ID: ${r.id}` }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_guardian_rule_remove')
            .setPlaceholder('Selecione uma regra para remover')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('guardian_open_rules_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};