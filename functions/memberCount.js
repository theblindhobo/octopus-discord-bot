const { guildId, channelId } = require('../config.json');

module.exports = {
  name: 'memberCount',
  execute(client) {

    const checkMemberCount = () => {
      const guild = client.guilds.cache.get(guildId);
      const Role = guild.roles.cache.find(role => role.name === 'Member');

      var memberCount = guild.members.cache.filter(member => member.roles.cache.find(role => role === Role)).size;
      return memberCount;
    };
    let currentMemberCount = checkMemberCount();

    let rateLimit = 0;
    let exceedsRateLimit = false;
    const resetRateLimit = () => {
      rateLimit = 0;
      exceedsRateLimit = false;
      setTimeout(resetRateLimit, 11 * 60 * 1000); // 11 mins reset
    }
    resetRateLimit();

    const updateMemberCount = () => {
      var memberCountChannel = client.channels.cache.get(channelId.memberCount);
      var memberCount = checkMemberCount();

      if(!exceedsRateLimit) {
        if(currentMemberCount !== memberCount) {
          memberCountChannel.setName(`Member Count: ${memberCount}`)
                .catch(error => console.log(error.message));
          rateLimit++;
          currentMemberCount = memberCount;
          if(rateLimit == 2) {
            exceedsRateLimit = true;
          }
          setTimeout(updateMemberCount, 5 * 1000); // 5 secs
        } else {
          setTimeout(updateMemberCount, 5 * 1000); // 5 secs
        }
      } else {
        setTimeout(updateMemberCount, 5 * 1000); // 5 secs
      }
    };
    updateMemberCount();

  },
}
