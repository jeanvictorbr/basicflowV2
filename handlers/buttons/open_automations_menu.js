// Substitua o conteúdo em: handlers/buttons/open_automations_menu.js
const buildAutomationsMenu = require('../../ui/automations/mainMenu');
const hasFeature = require('../../utils/featureCheck');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'open_automations_menu',
    async execute(interaction) {
        
        const hasFeat = await hasFeature(interaction.guild.id, 'AUTOMATIONS');
        
        if (!hasFeat) {
            // Este payload de erro também precisa ser V2
            return interaction.update({
                type: 17,
                components: [
                    { type: 10, content: "⚠️ Este módulo é uma funcionalidade premium e não está ativo neste servidor." },
                    { type: 14, divider: true, spacing: 2 },
                    { 
                        type: 1, components: [
                            { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'main_menu_back' }
                        ]
                    }
                ]
            });
        }

        const menu = await buildAutomationsMenu(interaction);
        
        // --- CORREÇÃO AQUI ---
        // Extrai o objeto V2 de dentro do array
        await interaction.update({ ...menu[0] });
    }
};