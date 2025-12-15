// handlers/commands/setup-music.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { encrypt } = require('../../utils/encryption.js');

module.exports = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add-worker') {
        await interaction.deferReply({ ephemeral: true });

        const token = interaction.options.getString('token');
        const clientId = interaction.options.getString('client_id');
        const name = interaction.options.getString('nome');

        // Criptografa o token antes de salvar
        const enc = encrypt(token);
        
        if (!enc) {
            return interaction.editReply('❌ Erro ao criptografar o token. Verifique os logs.');
        }

        try {
            await db.query(`
                INSERT INTO music_workers (client_id, token_enc, iv, name, is_active)
                VALUES ($1, $2, $3, $4, true)
                ON CONFLICT (client_id) 
                DO UPDATE SET token_enc = $2, iv = $3, name = $4, is_active = true
            `, [clientId, enc.content, enc.iv, name]);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('🎹 Worker Adicionado!')
                .setDescription(`O bot **${name}** foi registrado com sucesso no cluster de música.`)
                .addFields(
                    { name: 'Client ID', value: `\`${clientId}\``, inline: true },
                    { name: 'Status', value: '✅ Ativo e Pronto', inline: true }
                )
                .setFooter({ text: 'Reinicie o bot principal para o novo worker conectar.' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro ao salvar no banco de dados.');
        }
    }

    if (subcommand === 'list-workers') {
        await interaction.deferReply({ ephemeral: true });
        
        const result = await db.query('SELECT * FROM music_workers');
        
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`🎻 Orquestra de Música (${result.rows.length})`);

        if (result.rows.length === 0) {
            embed.setDescription('Nenhum bot cadastrado.');
        } else {
            const list = result.rows.map(w => {
                return `**🤖 ${w.name}**\nID: \`${w.client_id}\`\nStatus: ${w.is_active ? '✅ Ativo' : '🔴 Inativo'}`;
            }).join('\n\n');
            embed.setDescription(list);
        }

        await interaction.editReply({ embeds: [embed] });
    }
};