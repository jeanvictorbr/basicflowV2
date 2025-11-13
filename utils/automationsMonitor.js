// Substitua o conteúdo em: utils/automationsMonitor.js
const db = require('../database');
const parser = require('cron-parser');
const { V2_FLAG } = require('./constants'); 

const CHECK_INTERVAL_MS = 10000; // 10 segundos

/**
 * Envia a mensagem do anúncio.
 * @param {import('discord.js').Client} client 
 * @param {object} announcement 
 */
async function sendAnnouncement(client, announcement) {
    let channel;
    try {
        // 1. Verifica se a automação está ativa no servidor
        const settings = await db.query('SELECT enabled FROM automations_settings WHERE guild_id = $1', [announcement.guild_id]);
        
        if (!settings.rows[0] || !settings.rows[0].enabled) {
            console.log(`[Automations] Módulo desativado na guild ${announcement.guild_id}. Anúncio ${announcement.announcement_id} pulado.`);
            return;
        } else {
            console.log(`[Automations] Módulo ATIVO. Processando envio para anúncio ${announcement.announcement_id}.`);
        }

        // 2. Tenta encontrar o canal
        channel = await client.channels.cache.get(announcement.channel_id);
        if (!channel || !channel.isTextBased()) {
            console.warn(`[Automations] Canal ${announcement.channel_id} não encontrado ou não é de texto para o anúncio ${announcement.announcement_id}.`);
            return;
        }

        // 3. Prepara o payload
        let payload;
        try {
            if (typeof announcement.content_v2 === 'string') {
                payload = JSON.parse(announcement.content_v2);
            } else {
                payload = announcement.content_v2;
            }

            if (!payload || !payload.embeds) {
                 console.error(`[Automations] Payload inválido ou sem embeds para ${announcement.announcement_id}.`);
                 return;
            }
            
            if (payload.flags) {
                payload.flags &= ~V2_FLAG;
            }

            // --- LÓGICA ROBUSTA PARA @EVERYONE ---
            // Ignora o que está no JSON e usa a verdade absoluta do banco de dados
            if (announcement.mention_everyone) {
                payload.content = '@everyone';
            } else {
                // Se não for para mencionar, garante que o campo esteja vazio ou não tenha @everyone
                payload.content = ''; 
            }
            // -------------------------------------

        } catch (e) {
            console.error(`[Automations] Erro ao processar payload para o anúncio ${announcement.announcement_id}:`, e);
            return;
        }

        // 4. Envia
        await channel.send(payload);
        console.log(`[Automations] Anúncio ${announcement.announcement_id} (${announcement.name}) enviado para o canal ${channel.id}.`);

    } catch (err) {
        console.error(`[Automations] Falha ao enviar anúncio ${announcement.announcement_id}:`, err);
        if (channel) {
            try {
               await channel.send(`❌ Falha ao tentar enviar o anúncio agendado \`${announcement.name}\`. Verifique os logs do bot.`);
           } catch (e) {}
       }
    }
}

/**
 * Calcula e atualiza a próxima data de execução de um anúncio.
 * @param {object} announcement O objeto do anúncio
 */
async function rescheduleAnnouncement(announcement) {
    try {
        let interval;

        if (!announcement.enabled) {
            await db.query('UPDATE automations_announcements SET next_run_timestamp = 0 WHERE announcement_id = $1', [announcement.announcement_id]);
            return;
        }

        const options = { tz: 'Etc/UTC' }; 
        
        try {
            interval = parser.parseExpression(announcement.cron_string, options); 
        } catch (validationErr) {
            console.error(`[Automations] Cron string inválida (${announcement.cron_string}) para o anúncio ${announcement.announcement_id}. Re-agendamento pulado.`);
            await db.query('UPDATE automations_announcements SET next_run_timestamp = 0 WHERE announcement_id = $1', [announcement.announcement_id]);
            return;
        }

        const nextRunTimestamp = interval.next().getTime(); 

        await db.query('UPDATE automations_announcements SET next_run_timestamp = $1 WHERE announcement_id = $2', [nextRunTimestamp, announcement.announcement_id]);
        console.log(`[Automations] Anúncio ${announcement.announcement_id} (${announcement.name}) re-agendado para ${new Date(nextRunTimestamp).toISOString()}`);

    } catch (err) {
        console.error(`[Automations] Falha ao re-agendar anúncio ${announcement.announcement_id}:`, err);
    }
}


/**
 * Verifica o banco de dados por anúncios prontos para enviar.
 * @param {import('discord.js').Client} client 
 */
async function checkPendingAnnouncements(client) {
    const now = Date.now();
    let announcementsToSend = [];

    try {
        const { rows } = await db.query(
            'SELECT * FROM automations_announcements WHERE enabled = true AND next_run_timestamp > 0 AND next_run_timestamp <= $1',
            [now]
        );
        announcementsToSend = rows;
    } catch (err) {
        if (err.code !== '42P01') {
             console.error('[Automations] Falha ao buscar anúncios pendentes do DB:', err);
        }
        return; 
    }

    if (announcementsToSend.length > 0) {
        console.log(`[Automations] ${announcementsToSend.length} anúncios encontrados para envio.`);
    }

    for (const ann of announcementsToSend) {
        await sendAnnouncement(client, ann);
        await rescheduleAnnouncement(ann);
    }
}


/**
 * Inicia o monitor de automações.
 * @param {import('discord.js').Client} client 
 */
async function start(client) {
    console.log('[Monitor de Automações] Iniciando... (Modo: SetInterval)');
    
    setTimeout(() => checkPendingAnnouncements(client), 2000); 

    setInterval(() => {
        checkPendingAnnouncements(client);
    }, CHECK_INTERVAL_MS);

    console.log(`[Monitor de Automações] Loop de verificação rodando a cada ${CHECK_INTERVAL_MS / 1000} segundos.`);
}

module.exports = {
    start,
    rescheduleAnnouncement
};