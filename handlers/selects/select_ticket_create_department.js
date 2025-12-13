// handlers/selects/select_ticket_create_department.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'select_ticket_create_department_',
    async execute(interaction) {
        // Usa deferUpdate para evitar timeout visual, já que criar canal pode demorar
        await interaction.deferUpdate();

        const departmentId = interaction.values[0];
        
        // Busca o departamento
        const department = (await db.query('SELECT * FROM ticket_departments WHERE id = $1', [departmentId])).rows[0];
        if (!department) {
            return interaction.editReply({ content: '❌ Departamento não encontrado.', ephemeral: true });
        }

        // Busca configurações da guild
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const category = await interaction.guild.channels.fetch(settings.tickets_category).catch(() => null);
        
        if (!category) {
            return interaction.editReply({ content: '❌ Categoria de tickets não configurada ou inválida. Contate um administrador.', ephemeral: true });
        }

        try {
            // Calcula número do ticket
            const ticketCountResult = await db.query('SELECT ticket_number FROM tickets WHERE guild_id = $1 ORDER BY ticket_number DESC LIMIT 1', [interaction.guild.id]);
            const nextTicketNumber = (ticketCountResult.rows[0]?.ticket_number || 0) + 1;
            
            // --- INÍCIO DA LÓGICA DE PERMISSÕES CORRIGIDA ---
            const permissionOverwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] }
            ];

            let departmentRoles = [];
            let mentionString = '';

            // [CORREÇÃO CRÍTICA] Verificar o tipo antes de tentar parsear
            if (Array.isArray(department.role_id)) {
                // Se já for array (Postgres JSONB retorna assim automaticamente), usa direto
                departmentRoles = department.role_id;
            } else if (typeof department.role_id === 'string') {
                // Se for string, pode ser um JSON antigo ou um ID único antigo
                try {
                    const parsed = JSON.parse(department.role_id);
                    if (Array.isArray(parsed)) {
                        departmentRoles = parsed;
                    } else {
                        departmentRoles = [department.role_id]; // ID único tratado como array
                    }
                } catch (e) {
                    // Se falhar o parse, é uma string de ID simples (Legado)
                    departmentRoles = [department.role_id];
                }
            }

            // Filtra valores nulos ou vazios para evitar erro na API
            departmentRoles = departmentRoles.filter(id => id && typeof id === 'string' && id.length > 5);

            // Adiciona permissões para CADA cargo válido
            if (departmentRoles.length > 0) {
                departmentRoles.forEach(roleId => {
                    permissionOverwrites.push({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
                    });
                    mentionString += `<@&${roleId}> `;
                });
            } else if (settings.tickets_cargo_suporte) {
                // Fallback: Se não tiver cargos definidos no departamento, usa o Cargo Suporte Geral
                permissionOverwrites.push({
                    id: settings.tickets_cargo_suporte,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageMessages]
                });
                mentionString = `<@&${settings.tickets_cargo_suporte}>`;
            }
            // --- FIM DA LÓGICA DE PERMISSÕES ---

            const channelName = `${department.emoji ? department.emoji + '-' : ''}ticket-${String(nextTicketNumber).padStart(4, '0')}`;

            // Cria o canal
            const channel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: category,
                topic: `Ticket #${nextTicketNumber} | Dept: ${department.name} | User: ${interaction.user.id}`,
                permissionOverwrites: permissionOverwrites
            });
            
            // Salva no banco
            const initialLog = `> Ticket #${nextTicketNumber} aberto por <@${interaction.user.id}> no departamento **${department.name}**.\n`;
            await db.query('INSERT INTO tickets (channel_id, guild_id, user_id, action_log, ticket_number) VALUES ($1, $2, $3, $4, $5)', [channel.id, interaction.guild.id, interaction.user.id, initialLog, nextTicketNumber]);

            // Gera painel e envia
            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
            const dashboard = generateTicketDashboard(ticketData, interaction.member);

            await channel.send({ content: `${interaction.user} ${mentionString}`, ...dashboard });

            // Mensagem de saudação (opcional)
            if (settings.tickets_greeting_enabled) {
                const activeMessages = (await db.query('SELECT message FROM ticket_greeting_messages WHERE guild_id = $1 AND is_active = true ORDER BY id ASC', [interaction.guild.id])).rows;
                const sendSequentially = async () => {
                    for (const msg of activeMessages) {
                        const formattedMessage = msg.message
                            .replace('{user}', `<@${interaction.user.id}>`)
                            .replace('{server}', interaction.guild.name);
                        await channel.send({ content: formattedMessage });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                };
                sendSequentially();
            }

            // Confirmação para o usuário
            await interaction.editReply({ content: `✅ Ticket criado com sucesso: ${channel}`, components: [] });

        } catch (error) {
            console.error("Erro Ticket Create:", error);
            // Tenta avisar o usuário se algo der errado
            try {
                await interaction.editReply({ content: '❌ Ocorreu um erro ao criar o ticket. Verifique as permissões do bot ou contate o suporte.', components: [] });
            } catch (e) {
                // Se a mensagem original foi deletada ou algo assim, apenas loga
                console.error("Não foi possível enviar mensagem de erro:", e);
            }
        }
    }
};