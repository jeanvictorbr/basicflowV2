// schema.js
const guildSettingsTable = `
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id VARCHAR(255) PRIMARY KEY,

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
        ponto_cargo_em_servico VARCHAR(255)
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
        action_log TEXT DEFAULT ''
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

module.exports = [
    guildSettingsTable,
    pendingRegistrationsTable,
    ticketsTable,
    uniformsTable
];