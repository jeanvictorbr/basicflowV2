// handlers/buttons/ticket_claim.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_claim',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // 1. Busca dados do Ticket e Configurações
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        if (!ticket) {
            return interaction.editReply('❌ Este canal não está registrado como um ticket ativo.');
        }

        // 2. Lógica de Permissão Inteligente (A CORREÇÃO ESTÁ AQUI)
        let canClaim = false;

        // A) Verifica se o usuário é Administrador (Sempre pode)
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            canClaim = true;
        } 
        // B) Verifica Permissão de Departamento (Prioridade)
        else {
            // Tenta descobrir o departamento baseando-se no tópico do canal ou logs (método seguro)
            // Mas a melhor forma é verificar se o ticket tem permissão de cargo específica overwrite no canal
            const channelOverwrites = interaction.channel.permissionOverwrites.cache;
            
            // Verifica se o membro tem ALGUM cargo que está nas permissões do canal com "ManageMessages" ou "ViewChannel"
            // Isso cobre tanto o cargo do Departamento quanto o cargo Geral se ele estiver setado
            const memberHasAllowedRole = interaction.member.roles.cache.some(role => {
                const overwrite = channelOverwrites.get(role.id);
                if (overwrite && (overwrite.allow.has(PermissionsBitField.Flags.ViewChannel) || overwrite.allow.has(PermissionsBitField.Flags.ManageMessages))) {
                    return true;
                }
                return false;
            });

            if (memberHasAllowedRole) canClaim = true;

            // C) Fallback: Verifica o cargo de suporte geral (caso o ticket não tenha dept ou bugue)
            if (!canClaim && settings.tickets_cargo_suporte && interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
                canClaim = true;
            }
        }

        if (!canClaim) {
            return interaction.editReply('⛔ Você não tem permissão para assumir este ticket (Não possui o cargo do departamento nem suporte geral).');
        }

        // 3. Verifica se já tem dono
        if (ticket.claimed_by) {
            return interaction.editReply(`❌ Este ticket já foi assumido por <@${ticket.claimed_by}>.`);
        }

        // 4. Atualiza o Banco de Dados
        await db.query('UPDATE tickets SET claimed_by = $1, status = $2 WHERE channel_id = $3', [interaction.user.id, 'claimed', interaction.channel.id]);

        // 5. Atualiza o Canal (Renomeia e dá permissão explicita ao Staff)
        const oldName = interaction.channel.name;
        // Remove emoji antigo se tiver e adiciona o de claimed (opcional, mantendo simples)
        let newName = oldName.replace('ticket-', 'atend-'); 
        
        await interaction.channel.setName(newName).catch(() => {});

        // Adiciona o Staff especificamente no canal
        await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
            SendMessages: true,
            ManageMessages: true,
            AttachFiles: true
        });

        // 6. Resposta no Chat
        const claimEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`👮 **Atendimento Iniciado**\n\nEste ticket foi assumido por ${interaction.user}.\nAgora você está sendo atendido por um membro da equipe.`);

        await interaction.channel.send({ content: `<@${ticket.user_id}>`, embeds: [claimEmbed] });
        await interaction.editReply('✅ Você assumiu este ticket com sucesso!');
    }
};