const guildSettingsTable = `
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id VARCHAR(255) PRIMARY KEY,
        
        -- Módulo de Ausências
        ausencias_canal_aprovacoes VARCHAR(255),
        ausencias_cargo_ausente VARCHAR(255),
        ausencias_canal_logs VARCHAR(255),
        ausencias_imagem_vitrine VARCHAR(1024),

        -- Módulo de Registros
        registros_canal_aprovacoes VARCHAR(255),
        registros_cargo_novato VARCHAR(255),

        -- Módulo de Tickets
        tickets_canal_abertura VARCHAR(255),
        tickets_cargo_suporte VARCHAR(255),
        tickets_canal_logs VARCHAR(255),

        -- Módulo de Uniformes
        uniformes_cargo_masculino VARCHAR(255),
        uniformes_cargo_feminino VARCHAR(255),

        -- Módulo de Bate-Ponto
        ponto_canal_registros VARCHAR(255),
        ponto_cargo_em_servico VARCHAR(255)
    );
`;

module.exports = [
    guildSettingsTable
];