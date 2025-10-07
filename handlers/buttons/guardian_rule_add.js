// Crie em: handlers/buttons/guardian_rule_add.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_rule_add',
    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_guardian_rule_trigger')
            .setPlaceholder('Selecione o tipo de gatilho para a nova regra')
            .addOptions([
                { label: 'Nível de Toxicidade', value: 'TOXICITY', description: 'Aciona com base na análise de IA da mensagem.', emoji: '🤬' },
                { label: 'Repetição de Texto (Spam)', value: 'SPAM_TEXT', description: 'Aciona quando um usuário repete a mesma mensagem várias vezes.', emoji: '🔁' },
                { label: 'Spam de Menções', value: 'MENTION_SPAM', description: 'Aciona quando uma mensagem contém muitas menções.', emoji: '🗣️' },
            ]);

        const cancelButton = new ButtonBuilder().setCustomId('guardian_open_rules_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        await interaction.update({
            content: '**Passo 1 de 2: Escolha o gatilho**\nSelecione a condição que ativará a regra.',
            embeds: [],
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};