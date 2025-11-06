const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { getAnnouncementModal } = require('../../ui/announcementModal');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'anunciar',
	async execute(interaction, client, db) {
		const guild = interaction.guild;
		const channel = interaction.options.getChannel('canal');

		// 1. Verificação de permissões do bot no canal selecionado
		if (!guild.members.me.permissionsIn(channel).has(['SendMessages', 'ViewChannel'])) {
			return interaction.reply({
				content: '❌ | Eu preciso das permissões de **Visualizar Canal** e **Enviar Mensagens** no canal de destino.',
				flags: EPHEMERAL_FLAG,
			});
		}

		// 2. Criação do customId dinâmico (padrão 'nome_do_modal_IDDOELEMENTO')
		const modalCustomId = `modal_anunciar_submit_${channel.id}`;
        
        // 3. Obtém a estrutura JSON (componentes) do Modal a partir da pasta /ui
        const modalStructure = getAnnouncementModal(modalCustomId);

        // 4. Constrói o Modal usando Builders (necessário para interaction.showModal em d.js v14)
        const modal = new ModalBuilder()
            .setCustomId(modalCustomId)
            .setTitle(modalStructure.title);

        // Constrói os ActionRows e TextInputs a partir da estrutura JSON
        modalStructure.components.forEach(actionRowData => {
            const actionRow = new ActionRowBuilder();
            actionRowData.components.forEach(componentData => {
                const textInput = new TextInputBuilder()
                    .setCustomId(componentData.custom_id)
                    .setLabel(componentData.label)
                    .setStyle(componentData.style)
                    .setRequired(componentData.required);
                
                // CORREÇÃO: Aplicar setMaxLength/setMinLength SOMENTE se o valor estiver presente
                if (componentData.max_length) {
                    textInput.setMaxLength(componentData.max_length);
                }
                if (componentData.min_length) {
                    textInput.setMinLength(componentData.min_length);
                }
                
                if (componentData.placeholder) {
                    textInput.setPlaceholder(componentData.placeholder);
                }

                actionRow.addComponents(textInput);
            });
            modal.addComponents(actionRow);
        });

		// 5. Exibe o modal para o usuário
		await interaction.showModal(modal);
	},
};