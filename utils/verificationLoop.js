const { EmbedBuilder } = require('discord.js');
const database = require('../database');

async function startVerificationLoop(client) {
    console.log('[Verification Loop] Sistema iniciado. Aguardando novos usuários...');

    // 1. Garante a coluna de controle
    try {
        const db = await database.getClient();
        await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE");
        db.release();
    } catch (e) { 
        console.error("[Verification Loop] Erro inicial DB:", e.message); 
    }

    // 2. Loop Principal (15s)
    setInterval(async () => {
        try {
            const db = await database.getClient();
            
            // Busca pendentes
            const res = await db.query("SELECT * FROM users WHERE origin_guild IS NOT NULL AND processed = FALSE LIMIT 5");

            if (res.rows.length > 0) {
                console.log(`[Verification] Processando ${res.rows.length} novos usuários...`);
            }

            for (const userRow of res.rows) {
                const { id, origin_guild, username } = userRow;

                try {
                    const guild = client.guilds.cache.get(origin_guild);
                    
                    // Se o bot não estiver na guilda, marca como processado para não travar
                    if (!guild) {
                        console.log(`[Verification] Bot fora da guilda ${origin_guild}. Pulando user ${username}.`);
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue; 
                    }

                    // Busca configuração de cargo
                    const settingsRes = await db.query("SELECT cloudflow_verify_role_id FROM guild_settings WHERE guild_id = $1", [origin_guild]);
                    
                    // Se não tiver cargo configurado, finaliza
                    if (settingsRes.rows.length === 0 || !settingsRes.rows[0].cloudflow_verify_role_id) {
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue;
                    }
                    
                    const roleId = settingsRes.rows[0].cloudflow_verify_role_id;

                    // Tenta achar o membro
                    let member;
                    try {
                        member = await guild.members.fetch(id);
                    } catch (e) {
                        // Usuário não está no servidor ainda. Ignora neste ciclo.
                        continue; 
                    }

                    if (member) {
                        // --- 1. TENTA DAR O CARGO ---
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(roleId).catch(err => console.error(`[Erro Cargo] Não consegui dar cargo para ${username}: ${err.message}`));
                            console.log(`[Verification] ✅ Cargo entregue para ${username} (${guild.name})`);
                        }

                        // --- 2. TENTA ENVIAR A DM ---
                        try {
                            const embed = new EmbedBuilder()
                                .setTitle("🔐 Verificação Concluída!")
                                .setDescription(`Olá **${username}**, sua identidade foi confirmada com sucesso no servidor **${guild.name}**.`)
                                .setColor(0x57F287) // Verde Neon
                                .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
                                .addFields(
                                    { name: "👤 Usuário", value: `<@${id}>`, inline: true },
                                    { name: "🆔 ID", value: `\`${id}\``, inline: true },
                                    { name: "📅 Data", value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: true }
                                )
                                .setFooter({ text: "Sistema de Segurança • CloudFlow", iconURL: client.user.displayAvatarURL() })
                                .setTimestamp();

                            await member.send({ embeds: [embed] });
                            console.log(`[Verification] 📩 DM enviada para ${username}`);
                            
                        } catch (dmErr) {
                            // Logs específicos para saber POR QUE falhou
                            if (dmErr.code === 50007) {
                                console.log(`[Verification] ⚠️ DM falhou para ${username}: Usuário tem DMs fechadas.`);
                            } else {
                                console.error(`[Verification] ❌ Erro ao enviar DM para ${username}:`, dmErr.message);
                            }
                        }

                        // --- 3. MARCA COMO CONCLUÍDO NO BANCO ---
                        // Importante: Isso roda mesmo se a DM falhar, para não travar a fila
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                    }

                } catch (innerErr) {
                    console.error(`[Verification] Erro processando ${username}:`, innerErr.message);
                    // Se for erro grave, marca como processado para não travar o loop infinito
                    await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                }
            }
            db.release();
        } catch (err) {
            console.error("[Verification Loop] Erro Geral:", err.message);
        }
    }, 15 * 1000); // 15 Segundos
}

module.exports = { startVerificationLoop };