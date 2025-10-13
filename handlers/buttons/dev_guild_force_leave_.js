// Substitua em: handlers/buttons/dev_guild_force_leave_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_force_leave_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[4];
        // CORREÇÃO: Trocado .cache.get() por .fetch() para garantir que a guilda seja encontrada
        const guild = await interaction.client.guilds.fetch(guildId).catch(() => null);

        // Se, por algum motivo, a guilda realmente não existir, exibe uma mensagem de erro clara.
        if (!guild) {
            return interaction.update({
                components: [
                    {
                        type: 17, components: [
                            { type: 10, content: `## ⚠️ Erro` },
                            { type: 10, content: `> Não foi possível encontrar a guilda com ID \`${guildId}\`. O bot pode não estar mais nela.` }
                        ]
                    },
                    new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`dev_manage_guilds`).setLabel('Voltar para a Lista').setStyle(ButtonStyle.Secondary))
                ],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_guild_force_leave_confirm_${guildId}`).setLabel('Sim, Forçar Saída').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('dev_manage_guilds').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                {
                    type: 17, components: [
                        { type: 10, content: `## ⚠️ Confirmação` },
                        { type: 10, content: `> Tem certeza que deseja forçar o bot a sair do servidor **${guild.name}**? Esta ação não pode ser desfeita.` }
                    ]
                },
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};