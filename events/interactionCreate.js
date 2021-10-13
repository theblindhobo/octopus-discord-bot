const { channelId } = require('../config.json');
const screening = require('../functions/screening.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if(interaction.isButton()) {

      if(interaction.channelId === channelId.welcome) {
        const memberRoleId = interaction.member.guild.roles.cache.find(r => r.name === 'Member').id;
        const hasMemberRole = interaction.member._roles.includes(memberRoleId);

        if(interaction.customId === 'agree') {
          screening.agree(interaction, hasMemberRole);
        } else if(interaction.customId === 'disagree') {
          screening.disagree(interaction, hasMemberRole);
        }
      } else {
        if(interaction.customId === 'agree') {
          await interaction.reply({ content: 'Not in welcome', ephemeral: true});
        } else if(interaction.customId === 'disagree') {
          await interaction.reply({ content: 'DISAGREE and not in welcome', ephemeral: true});
        }
      }

    }
  },
}
