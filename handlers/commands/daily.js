const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {

    
    const userId = interaction.user.id;
    // No início da função execute(interaction) {
if (!interaction.member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ Este comando é exclusivo para Administradores do servidor.', ephemeral: true });
}
    
    // 1. Busca usuário
    let user = (await db.query('SELECT * FROM flow_users WHERE user_id = $1', [userId])).rows[0];
    
    // 2. Cria se não existir
    if (!user) {
        await db.query('INSERT INTO flow_users (user_id) VALUES ($1)', [userId]);
        user = { user_id: userId, balance: 0, last_daily: null };
    }

    // 3. Verifica Cooldown (24h)
    const now = new Date();
    if (user.last_daily) {
        const last = new Date(user.last_daily);
        const diff = now - last;
        const cooldown = 24 * 60 * 60 * 1000; // 24 horas em ms

        if (diff < cooldown) {
            const timeLeft = Math.ceil((cooldown - diff) / (1000 * 60 * 60));
            return interaction.reply({ 
                content: `⏳ Você já coletou hoje! Volte em **${timeLeft} horas** para farmar mais.`, 
                ephemeral: true 
            });
        }
    }

    // 4. Calcula Recompensa (Sorteio)
    const baseAmount = Math.floor(Math.random() * (150 - 50 + 1)) + 50; // Entre 50 e 150
    const jackpotChance = Math.random();
    let finalAmount = baseAmount;
    let message = `💰 Você recebeu **${baseAmount} FlowCoins**!`;

    // 10% de chance de Jackpot (2x)
    if (jackpotChance < 0.10) {
        finalAmount *= 2;
        message = `🎰 **JACKPOT!** Sorte grande! Você recebeu **${finalAmount} FlowCoins** (2x)!`;
    }

    // 5. Atualiza Banco
    await db.query(`
        UPDATE flow_users 
        SET balance = balance + $1, last_daily = NOW(), total_farmed = total_farmed + $1 
        WHERE user_id = $2
    `, [finalAmount, userId]);

    // 6. Mostra Saldo Atual
    const newBalance = parseInt(user.balance) + finalAmount;
    
    const embed = new EmbedBuilder()
        .setColor('#F1C40F') // Dourado
        .setTitle('Recompensa Diária Coletada!')
        .setDescription(`${message}\n\n👛 **Seu Saldo:** \`${newBalance} FC\``)
        .setFooter({ text: 'Use /loja-flow para gastar suas moedas!' });

    await interaction.reply({ embeds: [embed] });
};