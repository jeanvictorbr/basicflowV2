// Substitua o conteúdo em: handlers/buttons/guardian_step_add.js
const db = require('../../database.js');
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_step_add_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const policyId = interaction.customId.split('_')[3];

        const settings = (await db.query('SELECT guardian_use_mod_punishments FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const punishments = (await db.query('SELECT punishment_id, name, action FROM moderation_punishments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        const isIntegrationActive = settings.guardian_use_mod_punishments && punishments.length > 0;

        const options = isIntegrationActive ? punishments.map(p => ({
            label: p.name,
            value: p.punishment_id.toString(),
            description: `Ação: ${p.action}`
        })) : [{ label: 'Nenhuma punição personalizada encontrada', value: 'disabled' }];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_guardian_step_punishment_${policyId}`)
            .setPlaceholder(isIntegrationActive ? 'Vincular uma punição pré-configurada' : 'Integração desativada ou sem punições')
            .addOptions(options)
            .setDisabled(!isIntegrationActive);
        
        const simpleActionButton = new ButtonBuilder()
            // --- CORREÇÃO APLICADA AQUI ---
            .setCustomId(`guardian_action_create_simple_${policyId}`) // Usando o novo ID único
            .setLabel('Criar Ação Simples')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚙️');

        const cancelButton = new ButtonBuilder()
            .setCustomId(`guardian_manage_steps_${policyId}`)
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Danger);

        const components = [
            {
                "type": 17, "accent_color": 3447003,
                "components": [
                    { "type": 10, "content": `## ➕ Adicionar Passo (1/2)` },
                    { "type": 10, "content": `> Escolha uma punição da sua lista de pré-configuradas ou crie uma ação simples (como avisar no chat, deletar, etc).` }
                ]
            },
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(simpleActionButton, cancelButton)
        ];

        await interaction.editReply({
            components: components,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};