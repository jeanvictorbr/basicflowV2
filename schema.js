// Este arquivo define a estrutura do nosso banco de dados.

// Tabela para guardar as configurações de cada servidor
const guildSettingsTable = `
    CREATE TABLE IF NOT EXISTS guild_settings (
        guild_id VARCHAR(255) PRIMARY KEY,
        ausencias_canal_aprovacoes VARCHAR(255),
        ausencias_cargo_ausente VARCHAR(255),
        ausencias_canal_logs VARCHAR(255),
        ausencias_imagem_vitrine VARCHAR(1024)
        -- Adicione aqui futuras colunas para outros módulos (ex: tickets_canal_logs)
    );
`;

// Exportamos um array com todas as nossas "CREATE TABLE" queries.
// O inicializador do banco de dados vai rodar cada uma delas.
module.exports = [
    guildSettingsTable
    // Adicione outras tabelas aqui, se necessário.
];