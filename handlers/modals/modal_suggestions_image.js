const { MessageFlags } = require('discord.js');
const db = require('../../database.js'); 

module.exports = {
    customId: 'modal_suggestions_image',
    execute: async (interaction, client) => {
        
        const imageUrl = interaction.fields.getTextInputValue('image_url');

        if (!imageUrl.match(/^https?:\/\/.*/)) {
            return interaction.reply({ 
                content: '❌ Link inválido. Use um link http:// ou https://', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            // CORREÇÃO: Apontando para guild_settings
            await db.query(`
                INSERT INTO guild_settings (guild_id, suggestions_vitrine_image)
                VALUES ($1, $2)
                ON CONFLICT (guild_id)
                DO UPDATE SET suggestions_vitrine_image = $2
            `, [interaction.guild.id, imageUrl]);

            await interaction.reply({ 
                content: '✅ Imagem da vitrine salva! Clique em **"Publicar Vitrine"** no menu para ver a mudança.', 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('Erro DB:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: '❌ Erro no banco de dados. Certifique-se de que rodou o arquivo fix_db.js', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
    }
};