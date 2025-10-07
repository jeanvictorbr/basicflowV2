// Crie em: handlers/buttons/mod_punicao_remove.js
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_punicao_remove',
    async execute(interaction) {
        const punishments = (await db.query('SELECT punishment_id, name FROM moderation_punishments WHERE guild_id = $1', [interaction.guild.id])).rows;
        if (punishments.length === 0) {
            // Este botão deve estar desativado se não houver punições, mas esta é uma segurança extra.
            return interaction.reply({ content: 'Não há punições personalizadas para remover.', ephemeral: true });
        }

        const options = punishments.map(p => ({
            label: p.name,
            value: p.punishment_id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_mod_punicao_remove')
            .setPlaceholder('Selecione a punição que deseja remover')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('mod_gerir_punicoes').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};