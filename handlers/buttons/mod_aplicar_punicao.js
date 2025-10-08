// Substitua o conteúdo em: handlers/buttons/mod_aplicar_punicao.js
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_aplicar_punicao_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[3];
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
            return interaction.followUp({ content: '❌ Membro não encontrado.', ephemeral: true });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_mod_punicao_${targetId}`)
            .setPlaceholder('Selecione a punição a ser aplicada')
            .addOptions([
                { label: 'Avisar Membro (DM)', value: 'warn', emoji: '⚠️' },
                { label: 'Silenciar (Timeout)', value: 'timeout', emoji: '🔇' },
                { label: 'Expulsar (Kick)', value: 'kick', emoji: '🚪' },
                { label: 'Banir', value: 'ban', emoji: '🚫' },
            ]);
        
        const cancelButton = new ButtonBuilder().setCustomId(`mod_dossie_cancel_${targetId}`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        const actionComponents = [
            { "type": 1, "components": [selectMenu.toJSON()] },
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 1, "components": [cancelButton.toJSON()] }
        ];

        const dossiePayload = await generateDossieEmbed(interaction, member, history, notes, 0, { actionComponents });

        await interaction.editReply({
            ...dossiePayload,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};