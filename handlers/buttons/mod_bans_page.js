// Crie em: handlers/buttons/mod_bans_page.js
const generateModeracaoBansMenu = require('../../ui/moderacaoBansMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_bans_page_', // Handler dinâmico
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();

        const bans = await interaction.guild.bans.fetch();
        const bannedUsers = Array.from(bans.values());
        
        await interaction.editReply({
            components: generateModeracaoBansMenu(bannedUsers, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};