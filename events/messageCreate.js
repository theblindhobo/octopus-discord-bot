const fetch = require('node-fetch');
const { DMChannel } = require('discord.js');
const { agreeDisagree } = require('../buttons/welcome.js');
const posts = require('../commands/posts.js');
const { channelId } = require('../config.json');


module.exports = {
  name: 'messageCreate',
  execute(message) {
    if(message.webhookID || message.author.bot || message.channel instanceof DMChannel) return; // Ignores Webhooks, other Bots, and DM messages
    if(message.channel.id === channelId.selfPromotion) return; // Unik Bot takes care of this channel

    const PREFIX = '!';
    var arrayCmd = message.content.toLowerCase().substring(PREFIX.length).split(' ');
    var stringCmd = message.content.toLowerCase().substring(PREFIX.length);
    const memberRoles = require('../functions/roles.js').execute(message);


    if(message.channel.id === channelId.postToUpdates) { // Post to updates
      posts.postToUpdates(message);
    } else if(message.content.startsWith(PREFIX)) { // Commands
      if(memberRoles.dev) {
        if(arrayCmd[0] === 'post-as') {
          posts.postAs(message);
        } else if(stringCmd === 'post-links') {
          posts.postLinks(message);
        } else if(stringCmd === 'welcomecommands') {
          require('../commands/welcome.js').execute(message);
        }
      }
      // add command functionality here
    }

    if(message.channel.id === channelId.demoSubmissions) { // Demo Submissions
      require('../functions/demos.js').execute(message, memberRoles, channelId);
    }




  }
}
