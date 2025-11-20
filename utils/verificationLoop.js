const { EmbedBuilder } = require('discord.js');
const database = require('../database'); // Importa o seu módulo database.js

async function startVerificationLoop(client) {
    console.log('[Verification Loop] Iniciado. Verificando novos usuários...');

    // 1. Migração Automática: Garante que a coluna de controle existe
    try {
        // CORREÇÃO: Usa .getClient() em vez de pool.connect()
        const db = await database.getClient();
        await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE");
        db.release(); // Solta a conexão
    } catch (e) { 
        console.error("[Verification Loop] Erro ao verificar coluna 'processed':", e.message); 
    }

    // 2. O Loop (Roda a cada 15 segundos)
    setInterval(async () => {
        try {
            // CORREÇÃO: Usa .getClient() aqui também
            const db = await database.getClient();
            
            // Busca usuários que logaram (têm origin_guild) mas ainda não foram processados pelo bot
            const res = await db.query("SELECT * FROM users WHERE origin_guild IS NOT NULL AND processed = FALSE LIMIT 10");

            for (const userRow of res.rows) {
                const { id, origin_guild, username } = userRow;

                try {
                    // A. Verifica se o Bot está na Guilda
                    const guild = client.guilds.cache.get(origin_guild);
                    if (!guild) {
                        // Bot não está na guilda ou guilda inválida, ignora por enquanto
                        continue; 
                    }

                    // B. Pega a configuração do Cargo
                    // Note: Aqui usamos o próprio client (db) para a query
                    const settingsRes = await db.query("SELECT cloudflow_verify_role_id FROM guild_settings WHERE guild_id = $1", [origin_guild]);
                    
                    if (settingsRes.rows.length === 0 || !settingsRes.rows[0].cloudflow_verify_role_id) {
                        // Se não tem cargo configurado, marca como processado para não travar a fila
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue;
                    }
                    const roleId = settingsRes.rows[0].cloudflow_verify_role_id;

                    // C. Busca o Membro
                    let member;
                    try {
                        member = await guild.members.fetch(id);
                    } catch (e) {
                        // Usuário ainda não entrou no servidor
                        continue; 
                    }

                    // D. Dá o Cargo e Manda DM
                    if (member) {
                        // Adiciona Cargo
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(roleId).catch(err => console.error(`[Erro Cargo] ${err.message}`));
                            console.log(`[Verification] Cargo entregue para ${username} em ${guild.name}`);
                        }

                        // Envia DM Rica
                        try {
                            const embed = new EmbedBuilder()
                                .setTitle("🔐 Verificação Concluída!")
                                .setDescription(`Olá **${username}**, sua identidade foi confirmada com sucesso no servidor **${guild.name}**.`)
                                .setColor(0x57F287) // Verde Neon
                                .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
                                .addFields(
                                    { name: "👤 Usuário", value: `<@${id}>\n(\`${id}\`)`, inline: true },
                                    { name: "📅 Data da Verificação", value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true },
                                    { name: "🛡️ Status", value: "✅ **Acesso Liberado**", inline: false }
                                )
                                .setFooter({ text: "Sistema de Segurança • CloudFlow", iconURL: client.user.displayAvatarURL() })
                                .setTimestamp();

                            await member.send({ embeds: [embed] });
                            console.log(`[Verification] DM enviada para ${username}`);
                        } catch (dmErr) {
                            console.log(`[Verification] DM fechada para ${username}, mas cargo foi entregue.`);
                        }

                        // E. Marca como Processado no Banco (FIM)
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                    }
                } catch (innerErr) {
                    console.error(`[Verification] Erro pontual no user ${id}:`, innerErr.message);
                }
            }
            db.release(); // IMPORTANTE: Soltar a conexão no final do loop
        } catch (err) {
            console.error("[Verification Loop] Erro Geral:", err.message);
        }
    }, 15 * 1000); // 15 Segundos
}

module.exports = { startVerificationLoop };