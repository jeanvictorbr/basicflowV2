const { generateDevKeysMenu } = require('../../ui/devPanel/devKeysMenu');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'dev_manage_keys',
	async execute(interaction, client, db) {
		
		await interaction.deferUpdate();

		try {
			// O menu é gerado com a página 1 por padrão
			const { embeds, components } = await generateDevKeysMenu(db, 1); // <-- MUDANÇA: Desestruturação
		
			await interaction.editReply({
				embeds: embeds,       // <-- MUDANÇA: Passado explicitamente
				components: components, // <-- MUDANÇA: Passado explicitamente
				flags: EPHEMERAL_FLAG
			});

		} catch (error) {
			console.error('Erro ao gerar menu de chaves:', error);
			await interaction.editReply({
				content: '❌ Ocorreu um erro ao carregar o menu de chaves. Verifique os logs.',
				components: [],
				embeds: [],
				flags: EPHEMERAL_FLAG
			});
		}
	}
};