// Crie em: handlers/selects/select_uniforme_role.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'select_uniforme_role',
    async execute(interaction) {
        const roleId = interaction.values[0];

        if (roleId === 'none') {
            return interaction.reply({ content: 'Não há uniformes disponíveis no momento.', ephemeral: true });
        }
        
        await interaction.deferReply({ ephemeral: true });

        const uniform = (await db.query('SELECT * FROM uniforms WHERE role_id = $1 AND guild_id = $2', [roleId, interaction.guild.id])).rows[0];
        if (!uniform) {
            return interaction.editReply({ content: 'Este uniforme não foi encontrado ou não está mais disponível.' });
        }

        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) {
            return interaction.editReply({ content: 'O cargo associado a este uniforme não existe mais. Contate um administrador.' });
        }
        
        try {
            await interaction.member.roles.add(role);

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(`Uniforme Adquirido: ${uniform.name}`)
                .setDescription(uniform.description || 'Você pegou este uniforme com sucesso.')
                .setImage(uniform.image_url)
                .addFields({ name: 'Cargo Recebido', value: `${role}` });
            
            await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Erro ao dar cargo de uniforme:', error);
            await interaction.editReply({ content: `❌ Ocorreu um erro ao tentar te dar o cargo \`${role.name}\`. Verifique se minha posição de cargo está acima deste no servidor.` });
        }
    }
};