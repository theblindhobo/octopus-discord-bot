const { MessageButton, MessageActionRow } = require('discord.js');

const buttons = {
  agree: new MessageButton()
      .setStyle('SUCCESS')
      .setCustomId('agree')
      .setLabel('Agree')
      .setEmoji('✔️'),
  disagree: new MessageButton()
      .setStyle('DANGER')
      .setCustomId('disagree')
      .setLabel('Disagree')
      .setEmoji('❌')
};

const agreeDisagree = new MessageActionRow()
      .addComponents([
        buttons.agree, buttons.disagree
      ]);

module.exports = {
  agreeDisagree
};
