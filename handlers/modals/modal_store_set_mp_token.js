// handlers/modals/modal_store_set_mp_token.js
const db = require('../../database.js');
const generateConfigAdvancedMenu = require('../../ui/store/configAdvancedMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_set_mp_token',
    async execute(interaction) {
        // Importante: deferUpdate mantém a mensagem original até editarmos
        await interaction.deferUpdate();
        
        const token = interaction.fields.getTextInputValue('input_mp_token');

        // Salva o token
        await db.query('UPDATE guild_settings SET store_mp_token = $1 WHERE guild_id = $2', [token, interaction.guild.id]);

        // Gera o menu atualizado
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        let menu = await generateConfigAdvancedMenu(interaction, settings);
        
        // Garante que é um array
        if (!Array.isArray(menu)) menu = [menu];

        // ESTRATÉGIA DE CORREÇÃO:
        // Para interfaces V2, passamos o objeto principal como payload, adicionando as flags nele.
        // Isso evita que o Discord.js tente validar 'components' como ActionRows normais.
        const payload = menu[0]; 
        payload.flags = V2_FLAG | EPHEMERAL_FLAG;

        await interaction.editReply(payload);
        
        await interaction.followUp({ content: '✅ Token MP configurado!', flags: EPHEMERAL_FLAG });
    }
};