const { channelId } = require('../config.json');
const { MessageAttachment } = require('discord.js');

module.exports = {
  async postAs(message) {
      if(message.attachments.size > 0) {
        if(message.attachments.first().size > 3040870) { // 2.9Mb
          console.log('POST AS: File size too large to repost.');
          message.delete();
          await message.channel.send(`Sorry <@${message.author.id}>, that file is too large to repost. Try using something under 2.9MB.`)
                  .then(msg => {
                    setTimeout(() => msg.delete(), 10000);
                  })
                  .catch(error => console.log(error.message));
        } else {
          var attachment = new MessageAttachment(message.attachments.first().url);
          message.delete();
          var msgWithoutCmd = message.content.split(' ').slice(1).join(' ');
          await message.channel.send({ content: msgWithoutCmd, files:[attachment] });
        }
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
        if(message.attachments.first().size > 3040870) { // 2.9Mb
          console.log('POST AS: File size too large to repost.');
          await message.reply(`Sorry <@${message.author.id}>, that file is too large to repost. Try using something under 2.9MB.`);
        } else {
          var attachment = new MessageAttachment(message.attachments.first().url);
          await message.guild.channels.cache
                .get(channelId.updates)
                .send({ content: message.content, files: [attachment] })
                .catch(error => console.log(error.message));
          await message.reply(`Sent in <#${channelId.updates}>`);
        }
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
