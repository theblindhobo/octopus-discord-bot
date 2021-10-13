const Discord = require('discord.js');
const fetch = require('node-fetch');

const { client } = require('../index.js');

require('dotenv').config();
const { mixcloud } = require('../config.json');

const mixcloudObj = {
  key: '',
  createTime: '',
  url: ''
};

const findNewMixcloudShows = (client, channelID, token, userName) => {
  fetch(`https://api.mixcloud.com/${userName}/feed/?access_token=${token}`)
    .then(response => response.json())
    .then(data => {

      const isUpload = (e) => e.type === 'upload';
      const indexOfFirstUpload = data.data.findIndex(isUpload);

      const firstInFeed = data.data[indexOfFirstUpload].cloudcasts[0];
      const newestEntry = {
        key: firstInFeed.key,
        createTime: firstInFeed.created_time,
        type: data.data[indexOfFirstUpload].type,
        url: firstInFeed.url,
        name: firstInFeed.name,
        image: firstInFeed.pictures.extra_large,
        thumbnail: firstInFeed.pictures.medium_mobile,
        logo: firstInFeed.user.pictures.large
      };

      if(newestEntry.type === 'upload') {
        if(newestEntry.key !== mixcloudObj.key && newestEntry.createTime !== mixcloudObj.createTime) {
          client.channels.fetch(channelID)
            .then(channel => {
              channel.messages.fetch({ limit: 20 })
                .then(messages => {
                  var listOfMessages = [];
                  const mapMessages = messages.map(message => {
                    listOfMessages.push(message.content);
                  });
                  const allMessages = Promise.all(listOfMessages)
                    .then(result => {
                      var isInList = result.find(a => a.includes(newestEntry.url));
                      if(isInList === undefined) {
                        console.log(`MIXCLOUD (${userName}): New show found! Posting in channel now.`);
                        fetch(`https://api.mixcloud.com${newestEntry.key}`)
                          .then(response => response.json())
                          .then(data => {
                            const newestEntryDescription = data.description;
                            const mixcloudEmbed = new Discord.MessageEmbed()
                                .setColor('#52AAD8')
                                .setTitle(newestEntry.name)
                                .setURL(newestEntry.url)
                                .setAuthor(userName)
                                .setDescription(newestEntryDescription)
                                // .setThumbnail(newestEntry.logo)
                                .setThumbnail(newestEntry.image)
                                .setTimestamp();
                            return channel.send(`New show on Mixcloud: <${newestEntry.url}>`, { embed: mixcloudEmbed });
                          })
                          .catch(error => console.log(error.message));
                      } else if(isInList !== undefined) {
                        return console.log(`MIXCLOUD (${userName}): Bot already posted this Mixcloud show before.`);
                      }
                    })
                    .catch(error => console.log(error.message));
                })
                .catch(error => console.log(error.message));
            })
            .catch(error => console.log(error.message));
          // Update existing object
          mixcloudObj.key = newestEntry.key;
          mixcloudObj.createTime = newestEntry.createTime;
          mixcloudObj.url = newestEntry.url;
        } else {
          return console.log(`MIXCLOUD (${userName}): No new shows at this time.`);
        }
      } else {
        return console.log(`MIXCLOUD (${userName}): No new shows at this time.`);
      }
    })
    .catch(error => console.log(error.message));
};

const runQueryMixcloud = () => {
  findNewMixcloudShows(client, mixcloud.channel, process.env.MIXCLOUD_TOKEN, 'octopusrecordings');
};

module.exports = { runQueryMixcloud };
