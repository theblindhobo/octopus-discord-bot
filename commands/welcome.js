const { agreeDisagree } = require('../buttons/welcome.js');
const { channelId } = require('../config.json');


module.exports = {
  name: 'welcome',
  execute(message) {
    message.guild.channels.cache
        .get(channelId.welcome)
        .send({
          content: `
          *Welcome to the*\n\n      **OCTOPUS RECORDINGS** DISCORD SERVER\n\n    We ask that you be respectful of every member in this community. If you agree to these terms, please click \`AGREE\` below to join our Discord server.\n\n*To submit demos, you must first join the server.*||\n||­­­` });
    message.guild.channels.cache
        .get(channelId.welcome)
        .send({ content: `Do you agree or disagree?`, components: [agreeDisagree] });
  },
};
