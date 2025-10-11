// Crie em: handlers/buttons/dev_guild_force_leave_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_force_leave_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];
        const guild = interaction.client.guilds.cache.get(guildId);

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_guild_force_leave_confirm_${guildId}`).setLabel('Sim, Forçar Saída').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`select_dev_manage_guild`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: `## ⚠️ Confirmação` },
                    { type: 10, content: `> Tem certeza que deseja forçar o bot a sair do servidor **${guild.name}**? Esta ação não pode ser desfeita.` }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};