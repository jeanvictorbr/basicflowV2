// Crie em: handlers/buttons/dev_guild_reset_settings_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_reset_settings_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];
        const guild = interaction.client.guilds.cache.get(guildId);

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_guild_reset_settings_confirm_${guildId}`).setLabel('Sim, Resetar Configurações').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`select_dev_manage_guild`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: `## ⚠️ Confirmação` },
                    { type: 10, content: `> Tem certeza que deseja resetar **TODAS** as configurações do bot (exceto licenças) para o servidor **${guild.name}**? O dono precisará reconfigurar tudo do zero.` }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};