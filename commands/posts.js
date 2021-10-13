const { channelId } = require('../config.json');

module.exports = {
  postAs(message) {
      if(message.attachments.size > 0) {
        message.delete();
        var msgWithoutCmd = message.content.split(' ').slice(1).join(' ');
        message.channel.send(msgWithoutCmd, {files:[message.attachments.first().url]});
      } else if(message.content.split(' ').length > 1 && message.attachments.size === 0) {
        message.delete();
        message.channel.send(message.content.split(' ').slice(1).join(' '));
      } else {
        message.delete();
        console.log(`POST AS: Cannot send empty message.`);
      }
  },
  async postToUpdates(message) {
      if(message.attachments.size > 0) {
        message.guild.channels.cache
              .get(channelId.updates)
              .send(message.content, {files: [message.attachments.first().url]})
              .catch(error => console.log(error.message));
      } else if(message.content.split(' ').length > 0 && message.attachments.size === 0) {
        try {
          await message.guild.channels.cache
                .get(channelId.updates)
                .send(message.content)
                .catch(error => console.log(error.message));
          await message.reply(`Sent in <#${channelId.updates}>`)
        } catch(error) {
          console.log(error);
        }

      } else {
        message.reply(`Cannot send empty message.`);
        console.log(`POST TO UPDATES: Cannot send empty message.`);
      }
  },
  async postLinks(message) {
    try {
      await message.guild.channels.cache
          .get(channelId.links)
          .send(
            `Website: <https://OctopusRecordings.com>\nMerch: <https://OctopusRecordings.com/shop>\nFacebook: <https://facebook.com/OctopusRecordings>\nInstagram: <https://instagram.com/OctopusRecordings>\nTwitter: <https://twitter.com/OctopusRecords>\nTwitch: <https://twitch.tv/DJSianOfficial>\nDiscord: <https://tinyurl.com/octopusdiscord>\nYoutube: <https://bit.ly/SubscribeOctopus>\nSoundcloud: <https://soundcloud.com/OctopusRecordings>\nMixcloud: <https://mixcloud.com/OctopusRecordings>\nBeatport: <https://beatport.com/label/Octopus-Records/5281>`
          )
          .catch(error => console.log(error.message));
      await message.reply({
        content: `Links have been posted in <#${channelId.links}>`,
        ephemeral: true
      })
      .catch(error => console.log(error.message));
      await message.delete();
    } catch(error) {
      console.log(error);
    }

  },
};
