// schema.js
const guildSettingsTable = `
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id VARCHAR(255) PRIMARY KEY,

        -- Sistema de Licenciamento (PREMIUM)
        premium_status BOOLEAN DEFAULT false,
        premium_expires_at TIMESTAMPTZ,

        -- Módulo de Ausências
        ausencias_canal_aprovacoes VARCHAR(255),
        ausencias_cargo_ausente VARCHAR(255),
        ausencias_canal_logs VARCHAR(255),
        ausencias_imagem_vitrine VARCHAR(1024),
        ausencias_canal_vitrine VARCHAR(255),

        -- Módulo de Registros
        registros_canal_aprovacoes VARCHAR(255),
        registros_cargo_aprovado VARCHAR(255),
        registros_canal_logs VARCHAR(255),
        registros_tag_aprovado VARCHAR(255),
        registros_status BOOLEAN DEFAULT true,
        registros_canal_vitrine VARCHAR(255),
        registros_imagem_vitrine VARCHAR(1024),

        -- Módulo de Tickets
        tickets_painel_channel VARCHAR(255),
        tickets_cargo_suporte VARCHAR(255),
        tickets_canal_logs VARCHAR(255),
        tickets_category VARCHAR(255),
        tickets_thumbnail_url VARCHAR(1024),

        -- Módulo de Uniformes
        uniformes_thumbnail_url VARCHAR(1024),
        uniformes_color VARCHAR(7) DEFAULT '#FFFFFF',
        uniformes_vitrine_channel_id VARCHAR(255),
        uniformes_vitrine_message_id VARCHAR(255),

        -- Módulo de Bate-Ponto
        ponto_canal_registros VARCHAR(255),
        ponto_cargo_em_servico VARCHAR(255),
        ponto_imagem_vitrine VARCHAR(1024),
        ponto_status BOOLEAN DEFAULT false,
        ponto_afk_check_enabled BOOLEAN DEFAULT false,
        ponto_afk_check_interval_minutes INTEGER DEFAULT 60,
        ponto_vitrine_footer TEXT,
        ponto_vitrine_color VARCHAR(7),
        ponto_dashboard_v2_enabled BOOLEAN DEFAULT false
    );
`;

const activationKeysTable = `
    CREATE TABLE IF NOT EXISTS activation_keys (
        key VARCHAR(255) PRIMARY KEY,
        duration_days INTEGER NOT NULL,
        uses_left INTEGER DEFAULT 1,
        comment TEXT
    );
`;

const pendingRegistrationsTable = `
    CREATE TABLE IF NOT EXISTS pending_registrations (
        message_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        nome_rp VARCHAR(255) NOT NULL,
        id_rp VARCHAR(255) NOT NULL
    );
`;

const ticketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
        channel_id VARCHAR(255) PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        ticket_number SERIAL,
        claimed_by VARCHAR(255),
        status VARCHAR(20) DEFAULT 'open',
        action_log TEXT DEFAULT '',
        closed_at TIMESTAMPTZ
    );
`;

const uniformsTable = `
    CREATE TABLE IF NOT EXISTS uniforms (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(1024),
        preset_code TEXT NOT NULL
    );
`;

const pontoSessionsTable = `
    CREATE TABLE IF NOT EXISTS ponto_sessions (
        session_id SERIAL PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        log_message_id VARCHAR(255),
        dashboard_message_id VARCHAR(255),
        is_paused BOOLEAN DEFAULT false,
        last_pause_time TIMESTAMPTZ,
        total_paused_ms BIGINT DEFAULT 0
    );
`;

const pontoLeaderboardTable = `
    CREATE TABLE IF NOT EXISTS ponto_leaderboard (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        total_ms BIGINT DEFAULT 0,
        UNIQUE(guild_id, user_id)
    );
`;

const pendingAbsencesTable = `
    CREATE TABLE IF NOT EXISTS pending_absences (
        message_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        start_date VARCHAR(100),
        end_date VARCHAR(100),
        reason TEXT
    );
`;

// =======================================================
// ==                NOVAS TABELAS ABAIXO               ==
// =======================================================

const registrationsHistoryTable = `
    CREATE TABLE IF NOT EXISTS registrations_history (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        moderator_id VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL, -- 'approved' or 'rejected'
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
`;

const pontoHistoryTable = `
    CREATE TABLE IF NOT EXISTS ponto_history (
        id SERIAL PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        duration_ms BIGINT NOT NULL
    );
`;


module.exports = [
    guildSettingsTable,
    activationKeysTable,
    pendingRegistrationsTable,
    ticketsTable,
    uniformsTable,
    pontoSessionsTable,
    pontoLeaderboardTable,
    pendingAbsencesTable,
    registrationsHistoryTable,
    pontoHistoryTable
];