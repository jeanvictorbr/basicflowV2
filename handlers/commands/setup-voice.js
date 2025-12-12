const db = require('../../database.js');

module.exports = async (interaction) => {
    const channel = interaction.options.getChannel('canal');
    const category = interaction.options.getChannel('categoria');
    const categoryId = category ? category.id : null;

    // Verifica se já existe config para esse servidor
    const exists = await db.query('SELECT * FROM voice_hubs WHERE guild_id = $1', [interaction.guild.id]);
    
    if (exists.rows.length > 0) {
        await db.query('UPDATE voice_hubs SET trigger_channel_id = $1, category_id = $2 WHERE guild_id = $3', 
            [channel.id, categoryId, interaction.guild.id]);
    } else {
        await db.query('INSERT INTO voice_hubs (guild_id, trigger_channel_id, category_id) VALUES ($1, $2, $3)', 
            [interaction.guild.id, channel.id, categoryId]);
    }

    // Resposta Ephemeral padrão
    await interaction.reply({ 
        content: `✅ **Pronto!** O sistema de Voz foi configurado.\n\n🎤 **Canal Gatilho:** ${channel}\n📂 **Categoria Alvo:** ${category ? category.name : "Mesma do canal gatilho"}`,
        ephemeral: true 
    });
};