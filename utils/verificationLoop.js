const { EmbedBuilder } = require('discord.js');
const database = require('../database');

// Função de pausa para evitar spam de requisições
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function startVerificationLoop(client) {
    console.log('[Verification Loop] ✅ Sistema iniciado e blindado (Modo Seguro).');

    // 1. Garante a coluna de controle na tabela
    let initDb;
    try {
        initDb = await database.getClient();
        await initDb.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE");
    } catch (e) { 
        console.error("[Verification Loop] Erro inicial DB:", e.message); 
    } finally {
        if (initDb) initDb.release();
    }

    // 2. Loop Principal (Aumentado para 30 segundos para evitar Rate Limit)
    setInterval(async () => {
        let db;
        try {
            // Pega uma conexão do pool
            db = await database.getClient();
            
            // Busca usuários pendentes (limitado a 5 por vez)
            const res = await db.query("SELECT * FROM users WHERE origin_guild IS NOT NULL AND processed = FALSE LIMIT 5");

            if (res.rows.length > 0) {
                console.log(`[Verification] 🔎 Processando ${res.rows.length} novos usuários...`);
            }

            for (const userRow of res.rows) {
                const { id, origin_guild, username } = userRow;

                try {
                    // Pausa de 2 segundos entre cada usuário para não sobrecarregar a API
                    await sleep(2000);

                    // TRATAMENTO ESPECIAL: Login Global (sem guilda de origem)
                    if (origin_guild === 'global') {
                        console.log(`[Verification] 🌍 Usuário ${username} fez login Global. Apenas registrando.`);
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue;
                    }

                    // Verifica se o bot está na guilda
                    const guild = client.guilds.cache.get(origin_guild);
                    if (!guild) {
                        console.log(`[Verification] ⚠️ Bot não está na guilda ID ${origin_guild}. Finalizando pendência de ${username}.`);
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue; 
                    }

                    // Busca configuração de cargo
                    const settingsRes = await db.query("SELECT cloudflow_verify_role_id FROM guild_settings WHERE guild_id = $1", [origin_guild]);
                    
                    // Se não tiver cargo configurado, marca como feito e pula
                    if (settingsRes.rows.length === 0 || !settingsRes.rows[0].cloudflow_verify_role_id) {
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue;
                    }
                    
                    const roleId = settingsRes.rows[0].cloudflow_verify_role_id;

                    // Tenta achar o membro no servidor
                    let member;
                    try {
                        member = await guild.members.fetch(id);
                    } catch (e) {
                        // [CORREÇÃO CRÍTICA]
                        // Se der erro (ex: usuário não está no servidor), PRECISAMOS marcar como processado.
                        // Caso contrário, o bot tentará buscar esse usuário infinitamente a cada loop,
                        // causando "API Abuse" e desligamento pela Discloud.
                        console.log(`[Verification] ❌ Usuário ${username} (${id}) não encontrado no servidor. Cancelando verificação.`);
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                        continue; 
                    }

                    if (member) {
                        // 1. DAR O CARGO
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(roleId).catch(err => console.error(`[Erro Cargo] Falha ao dar cargo para ${username}:`, err.message));
                            console.log(`[Verification] ✅ Cargo entregue para ${username} em ${guild.name}`);
                        }

                        // 2. ENVIAR DM
                        try {
                            const embed = new EmbedBuilder()
                                .setTitle("🔐 Verificação Concluída!")
                                .setDescription(`Olá **${username}**, sua identidade foi confirmada com sucesso no servidor **${guild.name}**.`)
                                .setColor(0x57F287) // Verde Neon
                                .setThumbnail(guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
                                .addFields(
                                    { name: "👤 Usuário", value: `<@${id}>`, inline: true },
                                    { name: "🆔 ID", value: `\`${id}\``, inline: true },
                                    { name: "🛡️ Status", value: "✅ **Acesso Liberado**", inline: false }
                                )
                                .setFooter({ text: "Sistema de Segurança • CloudFlow", iconURL: client.user.displayAvatarURL() })
                                .setTimestamp();

                            await member.send({ embeds: [embed] });
                            console.log(`[Verification] 📩 DM enviada para ${username}`);
                        } catch (dmErr) {
                            // Ignora erro de DM fechada, mas loga
                            if (dmErr.code !== 50007) {
                                console.error(`[Verification] ❌ Erro DM para ${username}:`, dmErr.message);
                            }
                        }

                        // 3. MARCAR COMO CONCLUÍDO (Sucesso)
                        await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                    }

                } catch (innerErr) {
                    console.error(`[Verification] ❌ Erro Crítico processando ${username}:`, innerErr.message);
                    // Em caso de erro grave no user, marcamos como processado para não travar a fila eternamente
                    await db.query("UPDATE users SET processed = TRUE WHERE id = $1", [id]);
                }
            }
        } catch (err) {
            console.error("[Verification Loop] 💥 Erro Geral no Loop:", err.message);
        } finally {
            if (db) {
                try {
                    db.release();
                } catch (e) { /* ignora erro de release */ }
            }
        }
    }, 30 * 1000); // 30 Segundos (Seguro)
}

module.exports = { startVerificationLoop };