// handlers/buttons/mod_revogar_punicao.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getActiveSanctions } = require('./mod_ver_punicoes_ativas.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_revogar_punicao',
    async execute(interaction) {
        const sanctions = await getActiveSanctions(interaction.guild.id);
        
        if (sanctions.length === 0) {
            return interaction.reply({ content: 'Não há sanções ativas para revogar.', ephemeral: true });
        }

        const options = sanctions.slice(0, 25).map(s => {
            if (s.type === 'PUNISHMENT') {
                return {
                    label: `ID: ${s.id} | ${s.action} em ${s.userId}`,
                    description: `Motivo: ${s.reason.substring(0, 50)}`,
                    value: `punishment_${s.id}`,
                    emoji: s.action === 'BAN' ? '🚫' : '🔇'
                };
            }
            return {
                label: `Infração de ${s.userId}`,
                description: s.details,
                value: `infraction_${s.id}`,
                emoji: '🛡️'
            };
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_mod_revogar_punicao')
            .setPlaceholder('Selecione a sanção que deseja revogar')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('mod_ver_punicoes_ativas').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> Selecione no menu abaixo qual sanção deve ser removida/resetada manualmente." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};