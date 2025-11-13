// Substitua o conteúdo em: handlers/buttons/aut_sch_advanced_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_sch_advanced_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();
        
        let currentCron = '0 0 1 1 *';
        try {
            const { rows } = await db.query('SELECT cron_string FROM automations_announcements WHERE announcement_id = $1', [annId]);
            if (rows.length > 0) {
                currentCron = rows[0].cron_string;
            }
        } catch (e) {
            return interaction.reply({ content: '❌ Erro ao buscar o cron atual.', flags: EPHEMERAL_FLAG });
        }

        const modal = new ModalBuilder()
            .setCustomId(`aut_sch_advanced_modal_${annId}`)
            .setTitle('Agendamento Avançado (UTC)');

        // CORREÇÃO: Label e placeholder atualizados para (UTC)
        const cronInput = new TextInputBuilder()
            .setCustomId('aut_sch_cron')
            .setLabel('Cron String (Baseada em UTC)')
            .setPlaceholder('MIN HORA DIA MÊS DIASEMANA')
            .setStyle(TextInputStyle.Short)
            .setValue(currentCron)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(cronInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};