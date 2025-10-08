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
            await interaction.reply({ content: 'Não há sanções ativas para revogar.', ephemeral: true });
            // Recarrega o menu principal para refletir o estado vazio
            const generateModeracaoPunicoesAtivasMenu = require('../../ui/moderacaoPunicoesAtivasMenu.js');
            return interaction.update({
                components: generateModeracaoPunicoesAtivasMenu(sanctions, 0),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }

        // Busca os nomes de usuário para uma exibição mais clara
        const userIds = [...new Set(sanctions.map(s => s.userId))];
        const userTags = new Map();
        for (const id of userIds) {
            try {
                const user = await interaction.client.users.fetch(id);
                userTags.set(id, user.tag);
            } catch {
                userTags.set(id, 'ID: ' + id);
            }
        }

        const options = sanctions.slice(0, 25).map(s => {
            const userTag = userTags.get(s.userId);
            if (s.type === 'PUNISHMENT') {
                return {
                    label: `${s.action} em ${userTag}`,
                    description: `ID: ${s.id} | Motivo: ${s.reason.substring(0, 40)}`,
                    value: `punishment_${s.id}`,
                    emoji: s.action === 'BAN' ? '🚫' : '🔇'
                };
            }
            // s.type === 'INFRACTION'
            return {
                label: `Infração de ${userTag}`,
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