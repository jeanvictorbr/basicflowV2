const guildSettingsTable = `
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id VARCHAR(255) PRIMARY KEY,
        
        -- Colunas do Módulo de Ausências
        ausencias_canal_aprovacoes VARCHAR(255),
        ausencias_cargo_ausente VARCHAR(255),
        ausencias_canal_logs VARCHAR(255),
        ausencias_imagem_vitrine VARCHAR(1024),

        -- Colunas do Módulo de Tickets (NOVAS)
        tickets_canal_abertura VARCHAR(255),
        tickets_cargo_suporte VARCHAR(255),
        tickets_canal_logs VARCHAR(255)
        
        -- Adicione aqui futuras colunas para outros módulos
    );
`;

module.exports = [
    guildSettingsTable
];