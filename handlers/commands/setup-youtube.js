const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database.js');
const fetch = require('node-fetch'); // Certifique-se de ter node-fetch ou axios

module.exports = {
    data: new SlashCommandBuilder().setName('setup-youtube'), // (Apenas referência)
        
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({ content: '❌ Apenas o dono.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const attachment = interaction.options.getAttachment('arquivo');
        
        try {
            // Baixa o conteúdo do arquivo enviado
            const response = await fetch(attachment.url);
            const textData = await response.text();
            
            let finalCookie = '';

            try {
                // Tenta processar como JSON (Formato da Extensão)
                const cookies = JSON.parse(textData);
                if (Array.isArray(cookies)) {
                    finalCookie = cookies.map(c => `${c.name}=${c.value}`).join('; ');
                } else {
                    finalCookie = textData.trim(); // Pode ser só texto
                }
            } catch (e) {
                // Se não for JSON, assume que é texto puro
                finalCookie = textData.trim();
            }

            // Salva no Banco
            await db.query(`
                INSERT INTO bot_status (status_key, maintenance_message) 
                VALUES ('youtube_config', $1) 
                ON CONFLICT (status_key) 
                DO UPDATE SET maintenance_message = $1
            `, [finalCookie]);

            process.env.YOUTUBE_COOKIES = finalCookie;

            await interaction.editReply({ 
                content: '✅ **Arquivo processado com sucesso!**\nCookie do YouTube atualizado. Tente usar `/tocar`.' 
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao ler o arquivo.' });
        }
    }
};