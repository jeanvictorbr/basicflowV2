// File: handlers/buttons/membros_mass_transfer_GUILD.js
// O customId no index.js vai rotear 'membros_mass_transfer_GUILD' para este handler 'membros_mass_transfer_'
// CORREÇÃO: Para seguir o padrão, o arquivo deve ser:
// File: handlers/buttons/membros_mass_transfer_.js
module.exports = {
    customId: 'membros_mass_transfer_', // Pega 'membros_mass_transfer_GUILD'
    async execute(interaction) {
        
        const modal = {
            type: 9, // MODAL_SUBMIT
            custom_id: `modal_membros_mass_transfer_GUILD`, // Passa o scope 'GUILD'
            title: 'Transferir Membros em Massa',
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'dest_guild_id',
                            label: 'ID da Guilda de Destino',
                            style: 1, // Short
                            placeholder: 'Cole o ID do servidor para onde transferir',
                            required: true,
                        },
                    ],
                },
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 4, // Text Input
                            custom_id: 'quantity',
                            label: 'Quantidade',
                            style: 1, // Short
                            placeholder: 'Digite um número (ex: 50) ou "ALL" para todos',
                            required: true,
                        },
                    ],
                },
            ],
        };

        await interaction.showModal(modal);
    }
};