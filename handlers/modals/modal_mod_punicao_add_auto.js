// Crie em: handlers/modals/modal_mod_punicao_add_auto.js
const db = require('../../database.js');
const generateModeracaoPunicoesMenu = require('../../ui/moderacaoPunicoesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_mod_punicao_add_auto',
    async execute(interaction) {
        await interaction.deferUpdate();

        const name = interaction.fields.getTextInputValue('input_name');
        const action = interaction.fields.getTextInputValue('input_action').toUpperCase();
        const duration = interaction.fields.getTextInputValue('input_duration') || null;

        const validActions = ['WARN', 'TIMEOUT', 'KICK', 'BAN'];
        if (!validActions.includes(action)) {
            return interaction.followUp({ content: `❌ Ação inválida. Use uma das seguintes: ${validActions.join(', ')}`, ephemeral: true });
        }

        try {
            // Cria o cargo
            const newRole = await interaction.guild.roles.create({
                name: name,
                color: 'Default',
                reason: `Cargo de punição automática criado por ${interaction.user.tag}`,
            });

            // Salva a punição com o ID do novo cargo
            await db.query(
                'INSERT INTO moderation_punishments (guild_id, name, action, duration, role_id, auto_create_role) VALUES ($1, $2, $3, $4, $5, true)',
                [interaction.guild.id, name, action, duration, newRole.id]
            );

        } catch (error) {
            console.error("Erro ao criar cargo automático para punição:", error);
            return interaction.followUp({ content: '❌ Ocorreu um erro ao criar o cargo. Verifique se eu tenho a permissão "Gerir Cargos".', ephemeral: true });
        }

        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateModeracaoPunicoesMenu(punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};