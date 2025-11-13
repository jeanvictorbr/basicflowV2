// Substitua o conteúdo em: handlers/buttons/automations_toggle_system.js
const db = require('../../database');
const buildAutomationsMenu = require('../../ui/automations/mainMenu');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'automations_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.guild.id;

        try {
            const { rows } = await db.query('SELECT enabled FROM automations_settings WHERE guild_id = $1', [guildId]);
            const isEnabled = rows[0] ? rows[0].enabled : false;
            const newStatus = !isEnabled;

            await db.query(
                'INSERT INTO automations_settings (guild_id, enabled) VALUES ($1, $2) ON CONFLICT (guild_id) DO UPDATE SET enabled = $2',
                [guildId, newStatus]
            );

            const menu = await buildAutomationsMenu(interaction);
            
            // --- CORREÇÃO AQUI ---
            await interaction.editReply({ ...menu[0] });

        } catch (err) {
            console.error('Erro ao alternar status do módulo de automações:', err);
            // Payload de erro V2
            await interaction.editReply({
                type: 17,
                components: [
                    { type: 10, content: "❌ Ocorreu um erro ao atualizar as configurações." },
                    { type: 14, divider: true, spacing: 2 },
                    { 
                        type: 1, components: [
                            { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'main_menu_back' }
                        ]
                    }
                ]
            });
        }
    }
};