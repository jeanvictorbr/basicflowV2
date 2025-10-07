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
                { label: 'Repetição de Texto (Spam)', value: 'SPAM_TEXT', description: 'Aciona quando um usuário repete a mesma mensagem.', emoji: '🔁' },
                { label: 'Spam de Menções', value: 'MENTION_SPAM', description: 'Aciona quando uma mensagem contém muitas menções.', emoji: '🗣️' },
            ]);

        const cancelButton = new ButtonBuilder().setCustomId('guardian_open_rules_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        
        // --- CORREÇÃO APLICADA AQUI ---
        // O texto foi movido para dentro de um componente do tipo 10 (Texto)
        await interaction.update({
            content: null, // O campo 'content' foi removido
            embeds: [],
            components: [
                {
                    "type": 17, "accent_color": 15105570,
                    "components": [
                        { "type": 10, "content": "## 📜 Adicionar Nova Regra (Passo 1/2)"},
                        { "type": 10, "content": "> Selecione a **condição** que deve ativar a regra. No próximo passo, você definirá as ações."}
                    ]
                },
                new ActionRowBuilder().addComponents(selectMenu), 
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};