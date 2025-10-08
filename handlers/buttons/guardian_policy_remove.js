// Substitua em: handlers/buttons/guardian_policy_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_policy_remove',
    async execute(interaction) {
        const policies = (await db.query('SELECT id, name FROM guardian_policies WHERE guild_id = $1', [interaction.guild.id])).rows;
        if (policies.length === 0) {
            return interaction.reply({ content: 'Não há políticas para remover.', ephemeral: true });
        }
        
        const options = policies.map(p => ({ label: p.name, value: String(p.id) }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_guardian_policy_remove').setPlaceholder('Selecione uma política para remover').addOptions(options);

        const cancelButton = new ButtonBuilder().setCustomId('guardian_open_rules_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        // CORREÇÃO: Usa interaction.update() para substituir o menu atual, mantendo o contexto.
        await interaction.update({ 
            components: [
                { "type": 17, "components": [{ "type": 10, "content": "> Selecione a política para remover. **Atenção:** Isto removerá todos os passos associados a ela." }] },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ], 
            flags: V2_FLAG | EPHEMERAL_FLAG 
        });
    }
};