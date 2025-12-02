// Conteúdo completo para: handlers/commands/configurar.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const mainMenu = require('../../ui/mainMenu.js'); 
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js'); // [NOVO] Necessário para buscar o cargo no banco

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
    // 1. Adia a resposta para garantir que temos tempo
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    // --- [NOVO] Lógica de Permissão (Admin OU Staff da Loja) ---
    let settings = {};
    try {
        // Busca as configurações para saber o ID do cargo Staff
        const res = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        settings = res.rows[0];

        // Se não existir config, cria uma padrão para não quebrar
        if (!settings) {
            await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING', [interaction.guild.id]);
            settings = { guild_id: interaction.guild.id };
        }
    } catch (err) {
        console.error('Erro ao buscar permissões:', err);
    }

    // Verifica se é Admin
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    // Verifica se tem o cargo de Staff da Loja
    const isStoreStaff = settings?.store_staff_role_id && interaction.member.roles.cache.has(settings.store_staff_role_id);

    // Se NÃO for Admin E NÃO for Staff, bloqueia
    if (!isAdmin && !isStoreStaff) {
        return interaction.editReply({
            content: '❌ **Acesso Negado:** Você precisa de permissão de Administrador ou ter o cargo de **Staff da Loja** configurado.'
        });
    }
    // -----------------------------------------------------------

    try {
        // 3. Gerar o menu
        // O mainMenu (ui/mainMenu.js) retorna um ARRAY de componentes V2
        // Passamos 'settings' caso o menu precise dele futuramente
        const menuComponents = await mainMenu(interaction, 0, settings); 

        // 4. Responder com editReply
        await interaction.editReply({
            // ===================================================================
            //  ⬇️  A CORREÇÃO ESTÁ AQUI  ⬇️
            // ===================================================================

            // O array retornado pelo UI deve ser atribuído à chave 'components'
            components: menuComponents,

            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================
            
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

    } catch (error) {
        console.error('Erro ao executar /configurar:', error);
        await interaction.editReply({
            content: '❌ Ocorreu um erro ao buscar as configurações do servidor.'
        });
    }
}

// Exporta o execute para o index.js
module.exports = {
    execute,
};