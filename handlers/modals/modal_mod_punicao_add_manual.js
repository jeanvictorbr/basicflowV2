// Crie em: handlers/modals/modal_mod_punicao_add_manual.js
const db = require('../../database.js');
const generateModeracaoPunicoesMenu = require('../../ui/moderacaoPunicoesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_mod_punicao_add_manual',
    async execute(interaction) {
        await interaction.deferUpdate();

        const name = interaction.fields.getTextInputValue('input_name');
        const action = interaction.fields.getTextInputValue('input_action').toUpperCase();
        const duration = interaction.fields.getTextInputValue('input_duration') || null;
        // Tenta ler o roleId, mas não quebra se não existir (para o caso de "Sem Cargo")
        const roleId = interaction.fields.getTextInputValue('input_role_id') || null;

        const validActions = ['WARN', 'TIMEOUT', 'KICK', 'BAN'];
        if (!validActions.includes(action)) {
            return interaction.followUp({ content: `❌ Ação inválida. Use uma das seguintes: ${validActions.join(', ')}`, ephemeral: true });
        }

        await db.query(
            'INSERT INTO moderation_punishments (guild_id, name, action, duration, role_id, auto_create_role) VALUES ($1, $2, $3, $4, $5, false)',
            [interaction.guild.id, name, action, duration, roleId]
        );

        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateModeracaoPunicoesMenu(punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};