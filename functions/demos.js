let regEx = /\b(https?:\/\/.*?\.[a-z]{2,4}\/[^\s]*\b)/g;
let soundcloudRegEx = /\b(soundcloud).(com|app)/gi;
let otherSoundcloudRegEx = /\b(www.)?(soundcloud).(com|app)(\/[^\s]*\b)?/gi;
let httpsRegEx = /\b(https?:\/\/\b)/gi;

const checkDemos = (message, newMessage, channelId) => {
  var urls = newMessage.toLowerCase().match(regEx); // array, one or more
  return message.guild.channels.fetch(channelId.demoLogger)
      .then(channel => {
        return channel.messages.fetch({ limit: 20 })
            .then(messages => {
              var listOfMessages = [];
              const mapMessages = messages.map(msg => {
                var msgUrls = msg.content.toLowerCase().match(regEx)[0];
                listOfMessages.push(msgUrls);
              });
              const allMessages = Promise.all(listOfMessages)
                  .then(result => {
                    var isInList = result.filter(a => urls.includes(a));
                    if(isInList.length > 0) {
                      return true;
                    } else if(isInList.length === 0) {
                      // false, not in list
                      // all new urls, post full message
                      return false;
                    } else {
                      console.log(`DEMOS: Something went wrong in checkDemo() function.`)
                    }
                  })
                  .catch(error => console.log(error.message));
              return allMessages;
            })
            .catch(error => console.log(error.message));
      })
      .catch(error => console.log(error.message));
};

module.exports = {
  async execute(message, memberRoles, channelId) {
    if(message.author.bot) return;
    if(!memberRoles.dev || !memberRoles.admins || !memberRoles.unik) {
      var soundcloudWords = ['soundcloud.com', 'soundcloud.app'];
      if(!soundcloudWords.some(word => message.content.toLowerCase().includes(word))) {
        try {
          await message.delete()
            .then(() => {
                message.channel.send(`Sorry <@${message.author.id}>, only Soundcloud links allowed in <#${channelId.demoSubmissions}>.`)
                  .then(msg => {
                    setTimeout(() => msg.delete(), 10000);
                  })
                  .catch(error => console.log(error.message));
            })
            .catch(error => console.log(error.message));
          var demoErrorLogger = message.guild.channels.cache.find(channel => channel.id === channelId.demoErrorLogger);
          await demoErrorLogger.send(`__DEMO-SUBMISSION:__ <@${message.author.id}>: ` + message.content);
        } catch(error) {
          console.log(error);
        }
      } else {
        let newMessage;
        if(message.content.match(soundcloudRegEx)) {
          if(!message.content.match(httpsRegEx)) {
            newMessage = message.content.replace(otherSoundcloudRegEx, 'https://$&');
          } else if(message.content.match(httpsRegEx)) {
            newMessage = message.content.replace(httpsRegEx, 'https://');
          }
          var answer = await checkDemos(message, newMessage, channelId);
          if(answer === true) {
            console.log(`DEMOS: One or more tracks have already been posted from User ${message.author.id}.`);
            try {
              await message.delete()
                  .then(() => {
                    message.channel.send(`Sorry <@${message.author.id}>, one or more of your tracks have already been posted here. Please try again and only post new submissions!`)
                      .then(msg => {
                        setTimeout(() => msg.delete(), 10000);
                      })
                      .catch(error => console.log(error.message));
                  })
                  .catch(error => console.log(error.message));
              await message.member.guild.members.cache
                .get(message.author.id)
                .send(`Sorry <@${message.author.id}>, one or more of your tracks have already been posted here. Please try again and only post new submissions!`)
                .catch(() => console.log(`DEMOS: USER ${message.author.id} DOES NOT ACCEPT DIRECT MESSAGES!`));
            } catch(error) {
              console.log(error);
            }
          } else if(answer === false) {
            console.log(`DEMOS: New demo(s) submission from User ${message.author.id}.`);
            try {
              var demoLogger = message.guild.channels.cache.find(channel => channel.id === channelId.demoLogger);
              await demoLogger.send(`<@${message.author.id}>: ` + newMessage);
              await message.delete()
                .then(() => {
                    message.channel.send(`You have successfully submitted your demo(s) to Octopus Recordings!!\nThank you <@${message.author.id}> for your submission!`)
                      .then(msg => {
                        setTimeout(() => msg.delete(), 10000);
                      })
                      .catch(error => console.log(error.message));
                })
                .catch(error => console.log(error.message));
              await message.member.guild.members.cache
                .get(message.author.id)
                .send(`You have successfully submitted your demo to Octopus Recordings!!\nThank you <@${message.author.id}> for your submission!`)
                .catch(() => console.log(`DEMOS: USER ${message.author.id} DOES NOT ACCEPT DIRECT MESSAGES!`));
            } catch(error) {
              console.log(error);
            }
          } else {
            console.log(`DEMOS: Something went wrong when checking previous messages.`);
            try {
              await message.delete()
                  .then(() => {
                    message.channel.send(`Sorry <@${message.author.id}>, something went wrong. Please try again and only post new submissions! Try adding **https://** to the beginning of your URLs!`)
                      .then(msg => {
                        setTimeout(() => msg.delete(), 10000);
                      })
                      .catch(error => console.log(error.message));
                  })
                  .catch(error => console.log(error.message));
              await message.member.guild.members.cache
                .get(message.author.id)
                .send(`Sorry <@${message.author.id}>, something went wrong. Please try again and only post new submissions! Try adding **https://** to the beginning of your URLs!`)
                .catch(() => console.log(`DEMOS: USER ${message.author.id} DOES NOT ACCEPT DIRECT MESSAGES!`));
            } catch(error) {
              console.log(error);
            }
          }
        }
      }
    }
  }
};
