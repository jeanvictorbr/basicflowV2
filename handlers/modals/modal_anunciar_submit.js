const { logEvent } = require('../../utils/webhookLogger');
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const { getAnnouncementPreview } = require('../../ui/announcementPreview');

module.exports = {
	customId: 'modal_anunciar_submit_',
	async execute(interaction, client, db) { // 'db' ainda é passado pelo index.js, mas o logger não o usa mais como argumento
		const guild = interaction.guild;
		const channelId = interaction.customId.split('_').pop();

		// 1. Coleta todos os dados do Modal
		const modalData = {
			title: interaction.fields.getTextInputValue('announcement_title'),
			content: interaction.fields.getTextInputValue('announcement_content'),
			image: interaction.fields.getTextInputValue('announcement_image_url'),
			thumbnail: interaction.fields.getTextInputValue('announcement_thumbnail_url'),
			footerText: interaction.fields.getTextInputValue('announcement_footer_text'),
		};

		const targetChannel = await guild.channels.fetch(channelId).catch(() => null);

		if (!targetChannel) {
			return interaction.reply({
				content: '❌ | O canal de destino não foi encontrado ou eu não tenho acesso a ele. A interação foi cancelada.',
				flags: EPHEMERAL_FLAG,
			});
		}

		// 3. Cria a pré-visualização e os botões de controle
		const preview = getAnnouncementPreview(channelId, modalData, client.mainColor);

		// 4. CORREÇÃO DE FLUXO E ERRO 'UNKNOWN MESSAGE':
		try {
			if (interaction.message) {
				// Se 'interaction.message' existe, o modal veio do botão "Editar".
				// Usamos interaction.update() para ATUALIZAR a mensagem de pré-visualização existente.
				// Isso fecha o modal e atualiza a mensagem em uma única ação.
				await interaction.update({
					content: `✅ **Pré-visualização Atualizada** (Canal: <#${channelId}>)\n\nConfira as alterações e clique em "Publicar" quando estiver pronto.`,
					embeds: preview.embeds,
					components: preview.components,
					flags: EPHEMERAL_FLAG,
				});
			} else {
				// Se 'interaction.message' não existe, o modal veio do comando /anunciar.
				// Devemos CRIAR a primeira resposta de pré-visualização.
				await interaction.deferReply({ ephemeral: true });
				await interaction.editReply({
					content: `✅ **Pré-visualização do Anúncio** (Canal: <#${channelId}>)\n\n**Atenção:** Clique em "Publicar" para enviar.`,
					embeds: preview.embeds,
					components: preview.components,
					flags: EPHEMERAL_FLAG,
				});
			}
		} catch (error) {
			console.error('Erro ao tentar atualizar/responder na submissão do modal de anúncio:', error);
			// Se a interação falhar (ex: usuário demorou 15 min no modal e a msg efêmera sumiu),
			// tentamos enviar uma nova resposta de erro.
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					content: '❌ | Ocorreu um erro ao atualizar a pré-visualização. A mensagem original pode ter expirado. Por favor, tente novamente.',
					flags: EPHEMERAL_FLAG,
				});
			}
			return;
		}

		// 5. Loga o evento (sem passar 'db')
		logEvent(guild.id, 'Criação/Edição de Anúncio (Preview)',
			`Usuário ${interaction.user.tag} salvou um anúncio para o canal ${targetChannel.name} (${channelId}).`,
			{ type: 'ANNOUNCER_PREVIEW', user: interaction.user.id, channel: channelId, module: 'ANNOUNCER' });
	},
};