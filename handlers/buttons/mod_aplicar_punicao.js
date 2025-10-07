// Substitua em: handlers/buttons/mod_aplicar_punicao.js
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_aplicar_punicao_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[3];
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
            return interaction.followUp({ content: '❌ Membro não encontrado.', ephemeral: true });
        }

        // 1. Busca os dados necessários novamente
        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        // 2. Cria o novo componente (o menu de seleção)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_mod_punicao_${targetId}`)
            .setPlaceholder('Selecione a punição a ser aplicada')
            .addOptions([
                { label: 'Avisar Membro (DM)', value: 'warn', emoji: '⚠️' },
                { label: 'Silenciar (Timeout)', value: 'timeout', emoji: '🔇' },
                { label: 'Expulsar (Kick)', value: 'kick', emoji: '🚪' },
                { label: 'Banir', value: 'ban', emoji: '🚫' },
            ]);
        
        const customActionRow = new ActionRowBuilder().addComponents(selectMenu).toJSON();

        // 3. Reconstrói o Dossiê, passando o novo componente e a INTERACTION (esta era a causa do bug)
        const dossiePayload = generateDossieEmbed(member, history, notes, interaction, customActionRow);

        // 4. Atualiza a mensagem com a estrutura V2 completa e correta
        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};