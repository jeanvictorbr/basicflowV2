// Crie em: handlers/buttons/guardian_rule_toggle.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_rule_toggle',
    async execute(interaction) {
        const rules = (await db.query('SELECT id, name, is_enabled FROM guardian_rules WHERE guild_id = $1', [interaction.guild.id])).rows;
        const options = rules.map(r => ({ 
            label: r.name, 
            value: String(r.id), 
            description: `ID: ${r.id}`,
            emoji: r.is_enabled ? '🟢' : '🔴'
        }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_guardian_rule_toggle').setPlaceholder('Selecione uma regra para ativar/desativar').addOptions(options);
        const cancelButton = new ButtonBuilder().setCustomId('guardian_open_rules_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};