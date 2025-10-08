// handlers/buttons/dev_guild_edit_features.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FEATURES = require('../../config/features.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_edit_features_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];
        const settings = (await db.query('SELECT enabled_features FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const enabledFeatures = settings.enabled_features?.split(',') || [];

        const options = FEATURES.map(f => ({
            label: f.label,
            value: f.value,
            default: enabledFeatures.includes(f.value)
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_dev_guild_features_${guildId}`)
            .setPlaceholder('Selecione as features para esta guilda')
            .setMinValues(0)
            .setMaxValues(FEATURES.length)
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId(`dev_manage_guilds`).setLabel('Voltar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> Selecione as features que esta guilda deve ter. As já ativas estão pré-selecionadas." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};