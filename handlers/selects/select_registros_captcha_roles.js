// handlers/selects/select_registros_captcha_roles.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'select_registros_captcha_roles',
    async execute(interaction) {
        await interaction.deferUpdate();
        const roleIds = interaction.values; // interaction.values é um array
        
        // Salva o array de IDs diretamente (PostgreSQL TEXT[])
        await db.query('UPDATE guild_settings SET captcha_verify_roles_to_grant = $1 WHERE guild_id = $2', [roleIds, interaction.guild.id]);

        const updatedSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateRegistrosMenu(interaction, updatedSettings);
        
        const rolesText = roleIds.map(id => `<@&${id}>`).join(', ');
        await interaction.editReply({ ...menu, flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: `✅ Cargos de verificação definidos para: ${rolesText}.`, ephemeral: true });
    }
};