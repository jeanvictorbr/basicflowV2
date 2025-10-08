// handlers/buttons/dev_key_create.js
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FEATURES = require('../../config/features.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_create',
    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_dev_key_features')
            .setPlaceholder('Selecione as features que esta chave irá liberar')
            .setMinValues(1)
            .setMaxValues(FEATURES.length)
            .addOptions(FEATURES);

        const cancelButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('dev_manage_keys').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );
        
        await interaction.update({
            components: [
                 { type: 17, components: [{ type: 10, "content": "> **Passo 1 de 2:** Selecione as funcionalidades que a nova chave irá conceder." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                cancelButton
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};