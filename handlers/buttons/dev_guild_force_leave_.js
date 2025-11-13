// Substitua em: handlers/buttons/dev_guild_force_leave_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_force_leave_',
    async execute(interaction) {
        // Pega o ID da guilda (índice 4)
        const guildId = interaction.customId.split('_')[4];
        
        // Tenta buscar a guilda
        const guild = await interaction.client.guilds.fetch(guildId).catch(() => null);

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

        // CORREÇÃO AQUI: Alterado o ID para 'dev_guild_confirm_leave_' para evitar conflito
        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_guild_confirm_leave_${guildId}`).setLabel('Sim, Forçar Saída').setStyle(ButtonStyle.Danger),
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