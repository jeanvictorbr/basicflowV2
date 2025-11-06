const { logEvent } = require('../../utils/webhookLogger');
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js'); // <-- Importações verificadas

module.exports = {
	customId: 'anuncio_send_',
	async execute(interaction, client, db) { // 'db' é recebido mas não usado na chamada de log
		const channelId = interaction.customId.split('_').pop();
		const guild = interaction.guild;
		const user = interaction.user;

		// 1. Desabilita os botões de controle temporariamente
		await interaction.deferUpdate();

		// 2. Tenta obter o Embed da mensagem de preview
		const previewEmbedData = interaction.message.embeds[0];

		if (!previewEmbedData) {
			return interaction.editReply({
				content: '❌ | Não foi possível recuperar os dados da pré-visualização. Por favor, reinicie o comando.',
				components: [],
				embeds: [],
				flags: EPHEMERAL_FLAG,
			});
		}

		// 3. Constrói o Embed final
		const finalEmbed = EmbedBuilder.from(previewEmbedData);
		let finalFooter = `Anúncio por: ${user.tag}`;

		// Combina o rodapé customizado (se existir) com o rodapé de autoria
		if (previewEmbedData.footer && previewEmbedData.footer.text) {
			const customFooter = previewEmbedData.footer.text.split(' • Anúncio por:')[0]; // Limpa rodapé antigo, se houver
			finalFooter = `${customFooter} • ${finalFooter}`;
		}
		
		finalEmbed.setFooter({
			text: finalFooter,
			iconURL: user.displayAvatarURL({ dynamic: true })
		});


		const targetChannel = await guild.channels.fetch(channelId).catch(() => null);

		if (!targetChannel) {
			return interaction.editReply({
				content: '❌ | O canal de destino não foi encontrado ou o bot perdeu o acesso. O anúncio foi cancelado.',
				components: [],
				embeds: [],
				flags: EPHEMERAL_FLAG,
			});
		}

		// 4. Envia o Anúncio
		let sentMessage = null;
		try {
			sentMessage = await targetChannel.send({ embeds: [finalEmbed] });
		} catch (error) {
			console.error('Erro ao enviar anúncio:', error);
			return interaction.editReply({
				content: `❌ | Houve um erro ao tentar enviar o anúncio no canal ${targetChannel}: \`\`\`${error.message}\`\`\``,
				components: [],
				embeds: [],
				flags: EPHEMERAL_FLAG,
			});
		}

		// 5. Atualiza a mensagem de preview para confirmação com o link
		const linkButton = new ButtonBuilder()
			.setLabel('Ver Anúncio Publicado')
			.setStyle(ButtonStyle.Link)
			.setURL(sentMessage.url);

		const actionRow = new ActionRowBuilder().addComponents(linkButton);

		await interaction.editReply({
			content: `✅ | **Anúncio Publicado com Sucesso!**\nO seu anúncio foi enviado para ${targetChannel}.`,
			embeds: [],
			components: [actionRow.toJSON()],
			flags: EPHEMERAL_FLAG,
		});

		// 6. Loga o evento (sem passar 'db')
		logEvent(guild.id, 'Anúncio Publicado',
			`Usuário ${user.tag} publicou um anúncio no canal ${targetChannel.name} (${targetChannel.id}).\nTítulo: ${finalEmbed.data.title || 'N/A'}`,
			{ type: 'ANNOUNCER_SENT', user: user.id, channel: channelId, module: 'ANNOUNCER' });
	},
};