// handlers/buttons/dev_key_revoke.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_revoke',
    async execute(interaction) {
        const keys = (await db.query('SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY key ASC')).rows;
        
        // CORRIGIDO: Verifica se a lista de opções está vazia
        if (keys.length === 0) {
            return interaction.update({
                components: [
                    { type: 17, components: [{ type: 10, content: "> Nenhuma chave ativa para revogar no momento." }] },
                    new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dev_manage_keys').setLabel('Voltar').setStyle(ButtonStyle.Secondary))
                ],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }

        const options = keys.map(k => ({
            label: k.key,
            description: `Features: ${k.grants_features} | Usos: ${k.uses_left}`,
            value: k.key,
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_dev_key_revoke')
            .setPlaceholder('Selecione a chave para revogar (deletar)')
            .addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('dev_manage_keys').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                { type: 17, components: [{ type: 10, content: "> Selecione a chave que deseja apagar permanentemente do sistema." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};