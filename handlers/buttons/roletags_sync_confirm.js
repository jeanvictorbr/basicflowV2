// handlers/buttons/roletags_sync_confirm.js
const { updateUserTag } = require('../../utils/roleTagUpdater.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'roletags_sync_confirm',
    async execute(interaction) {
        await interaction.update({
            components: [{ type: 17, components: [{ type: 10, content: "🔄 **Sincronização em massa iniciada...**\n> Estou a verificar e a atualizar os apelidos de todos os membros. Isto pode demorar alguns minutos." }] }],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        try {
            const members = await interaction.guild.members.fetch();
            let updatedCount = 0;
            
            for (const member of members.values()) {
                await updateUserTag(member);
                updatedCount++;
            }
            
            await interaction.followUp({ content: `✅ Sincronização concluída! ${updatedCount} membros foram verificados.`, ephemeral: true });
        } catch (error) {
            console.error('[RoleTags Sync] Erro durante a sincronização em massa:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro durante a sincronização. Verifique os logs do bot.', ephemeral: true });
        }
    }
};