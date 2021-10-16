const { guildId, channelId } = require('../config.json');

module.exports = {
  name: 'memberCount',
  async execute(client) {

    const checkMemberCount = () => {
      const guild = client.guilds.cache.get(guildId);
      const Role = guild.roles.cache.find(role => role.name === 'Member');

      var memberCount = guild.members.cache.filter(member => member.roles.cache.find(role => role === Role)).size;
      return memberCount;
    };
    let currentMemberCount = checkMemberCount();
    
    let rateLimit;
    const resetRateLimit = () => {
      rateLimit = 0;
      setTimeout(resetRateLimit, 10 * 60 * 1000); // 10 mins reset
    }
    resetRateLimit();

    const updateMemberCount = async () => {
      var memberCountChannel = client.channels.cache.get(channelId.memberCount);
      var memberCount = checkMemberCount();

      if(rateLimit >= 2) {
        if(currentMemberCount !== memberCount) {
          memberCountChannel.setName(`Member Count: ${memberCount}`)
                .catch(error => console.log(error.message));
          rateLimit = 0;
          currentMemberCount = memberCount;
        }
        setTimeout(updateMemberCount, 10 * 60 * 1000); // 10min
      } else if(currentMemberCount !== memberCount && rateLimit < 2) {
        memberCountChannel.setName(`Member Count: ${memberCount}`)
              .catch(error => console.log(error.message));
        rateLimit++;
        currentMemberCount = memberCount;
        setTimeout(updateMemberCount, 10000); // 10sec
      } else {
        setTimeout(updateMemberCount, 3000); // 3sec
      }
    };
    updateMemberCount();

  },
}
