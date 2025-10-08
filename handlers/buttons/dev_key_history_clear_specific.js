// handlers/buttons/dev_key_history_clear_specific.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_history_clear_specific',
    async execute(interaction) {
        await interaction.deferUpdate();

        const history = (await db.query('SELECT * FROM key_activation_history ORDER BY activated_at DESC')).rows;

        if (history.length === 0) {
            return interaction.followUp({ content: 'Não há registros no histórico para apagar.', ephemeral: true });
        }

        const options = history.slice(0, 25).map(entry => ({
            label: `Chave: ${entry.key.substring(0, 20)}...`,
            description: `Ativada em: ${entry.guild_name} por ${entry.user_tag}`,
            value: entry.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_dev_key_history_clear')
            .setPlaceholder('Selecione o registro do histórico para apagar')
            .addOptions(options);

        const cancelButton = new ButtonBuilder()
            .setCustomId('dev_open_key_history')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);
        
        await interaction.editReply({
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};