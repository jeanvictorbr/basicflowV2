const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // 1. Busca os bots registrados no banco
    const result = await db.query('SELECT client_id, name FROM music_workers WHERE is_active = true ORDER BY name ASC');
    const workers = result.rows;

    if (workers.length === 0) {
        return interaction.editReply('❌ Nenhum bot de música (Worker) foi configurado no sistema ainda.');
    }

    // 2. Cria o Embed Explicativo
    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('🎻 Instalação da Orquestra de Música')
        .setDescription('Para que o sistema de música funcione perfeitamente e suporte vários canais simultâneos, você precisa adicionar os **Bots Auxiliares (Workers)** abaixo.\n\n⚠️ **Eles não precisam de configurar nada**, apenas convide-os para o servidor.')
        .setFooter({ text: 'Sistema Multi-Client • Koda' });

    // 3. Cria os botões de link dinamicamente
    const rows = [];
    let currentRow = new ActionRowBuilder();

    workers.forEach((worker, index) => {
        // Link com permissão de Admin (conforme você pediu) e scope bot
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${worker.client_id}&permissions=8&integration_type=0&scope=bot`;

        const btn = new ButtonBuilder()
            .setLabel(`Adicionar ${worker.name}`)
            .setEmoji('🤖')
            .setStyle(ButtonStyle.Link) // Botão tipo Link
            .setURL(inviteUrl);

        currentRow.addComponents(btn);

        // O Discord só aceita 5 botões por linha
        if (currentRow.components.length === 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder();
        }
    });

    // Adiciona a última linha se tiver sobrado botões
    if (currentRow.components.length > 0) {
        rows.push(currentRow);
    }

    await interaction.editReply({ embeds: [embed], components: rows });
};