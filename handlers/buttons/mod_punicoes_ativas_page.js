// handlers/buttons/mod_punicoes_ativas_page.js
const generateModeracaoPunicoesAtivasMenu = require('../../ui/moderacaoPunicoesAtivasMenu.js');
const { getActiveSanctions } = require('./mod_ver_punicoes_ativas.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_punicoes_ativas_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[4], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const activeSanctions = await getActiveSanctions(interaction.guild.id);
        
        await interaction.editReply({
            components: generateModeracaoPunicoesAtivasMenu(activeSanctions, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};