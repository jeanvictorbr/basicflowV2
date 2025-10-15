// Crie em: handlers/buttons/architect_cancel_build.js
const db = require('../../database.js');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    customId: 'architect_cancel_build',
    async execute(interaction) {
        // Verifica se o usuário tem permissão para gerenciar o canal (ou é o criador)
        const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
        const isCreator = interaction.channel.topic === interaction.user.id;

        if (!hasPermission && !isCreator) {
            return interaction.reply({ content: 'Apenas quem iniciou esta sessão ou um administrador pode cancelá-la.', ephemeral: true });
        }
        
        await interaction.update({ content: 'Ok, cancelando a construção. Este canal será deletado em 5 segundos.', components: [], embeds: [] });
        
        try {
            await db.query('DELETE FROM architect_sessions WHERE channel_id = $1', [interaction.channel.id]);
            setTimeout(() => {
                interaction.channel.delete('Sessão do arquiteto cancelada pelo usuário.').catch(console.error);
            }, 5000);
        } catch (error) {
            console.error('[Arquiteto Cancel] Erro ao deletar sessão/canal:', error);
        }
    }
};