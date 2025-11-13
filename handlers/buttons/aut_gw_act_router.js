const db = require('../../database');
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { endGiveaway } = require('../../utils/giveawayManager');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_act_', 
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const action = parts[3]; // edit, end, reroll, roles, bonus, cancel
        const messageId = parts[4];

        // 1. Editar
        if (action === 'edit') {
            const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
            const modal = new ModalBuilder().setCustomId(`aut_gw_edit_sub_${messageId}`).setTitle('Editar Sorteio');
            const prizeInput = new TextInputBuilder().setCustomId('prize').setLabel('Prêmio').setValue(gw.prize).setStyle(TextInputStyle.Short);
            const descInput = new TextInputBuilder().setCustomId('desc').setLabel('Descrição').setValue(gw.description || '').setStyle(TextInputStyle.Paragraph).setRequired(false);
            const winnersInput = new TextInputBuilder().setCustomId('winners').setLabel('Vencedores').setValue(String(gw.winner_count)).setStyle(TextInputStyle.Short);
            modal.addComponents(new ActionRowBuilder().addComponents(prizeInput), new ActionRowBuilder().addComponents(descInput), new ActionRowBuilder().addComponents(winnersInput));
            return interaction.showModal(modal);
        }

        // 2. Sortear Agora (End Normal)
        if (action === 'end') {
            await interaction.deferUpdate();
            // false = no reroll, user = endedBy, false = not cancelled
            await endGiveaway(interaction.client, messageId, false, interaction.user, false);
            await interaction.followUp({ content: '✅ Sorteio realizado!', flags: EPHEMERAL_FLAG });
        }

        // 3. Reroll
        if (action === 'reroll') {
            await interaction.deferUpdate();
            await endGiveaway(interaction.client, messageId, true, interaction.user, false);
            await interaction.followUp({ content: '✅ Novos vencedores sorteados!', flags: EPHEMERAL_FLAG });
        }

        // 4. Cancelar (NOVO)
        if (action === 'cancel') {
            await interaction.deferUpdate();
            // false = no reroll, user = endedBy, true = IS CANCELLED
            await endGiveaway(interaction.client, messageId, false, interaction.user, true);
            await interaction.followUp({ content: '🚫 Sorteio cancelado com sucesso.', flags: EPHEMERAL_FLAG });
        }

        // 5. Configurar Cargos Obrigatórios
        if (action === 'roles') {
            const layout = {
                type: 17,
                components: [
                    { type: 10, content: "## 🔒 Restrição de Cargos\nSelecione cargos que são **obrigatórios** para participar." },
                    { type: 1, components: [{
                        type: 6, // Role Select
                        custom_id: `aut_gw_set_req_${messageId}`,
                        placeholder: "Selecione cargos obrigatórios...",
                        min_values: 0, max_values: 5
                    }]}
                ]
            };
            await interaction.reply({ components: [layout], flags: V2_FLAG | EPHEMERAL_FLAG });
        }

        // 6. Configurar Cargos Bônus
        if (action === 'bonus') {
            const gw = (await db.query("SELECT bonus_roles FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
            let currentBonus = "Nenhum bônus configurado.";
            
            if (gw.bonus_roles && Object.keys(gw.bonus_roles).length > 0) {
                currentBonus = Object.entries(gw.bonus_roles)
                    .map(([roleId, count]) => `• <@&${roleId}>: +**${count}** entradas`)
                    .join('\n');
            }

            const layout = {
                type: 17,
                components: [
                    { type: 10, content: `## ✨ Entradas Bônus\nConfigure cargos que dão chances extras.\n\n**Configuração Atual:**\n${currentBonus}` },
                    { type: 10, content: "Selecione um cargo abaixo para adicionar ou alterar o bônus." },
                    { type: 1, components: [{
                        type: 6, // Role Select
                        custom_id: `aut_gw_bonus_sel_${messageId}`,
                        placeholder: "Escolha um cargo para dar bônus...",
                        min_values: 1, max_values: 1
                    }]}
                ]
            };
            await interaction.reply({ components: [layout], flags: V2_FLAG | EPHEMERAL_FLAG });
        }
    }
};