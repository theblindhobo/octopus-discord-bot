module.exports = {
  name: 'roles',
  execute(message) {
      var memberRoles = {
        dev: message.member.roles.cache.find(r => r.name === "Dev"),
        bot: message.member.roles.cache.find(r => r.name === "Bot"),
        unik: message.member.roles.cache.find(r => r.name === "Unik"),
        admins: message.member.roles.cache.find(r => r.name === "Admins"),
        mod: message.member.roles.cache.find(r => r.name === "Mod"),
        artist: message.member.roles.cache.find(r => r.name === "Octopus Artist"),
        twitchTier3: message.member.roles.cache.find(r => r.name === "Tier 3"),
        twitchTier2: message.member.roles.cache.find(r => r.name === "Tier 2"),
        twitchTier1: message.member.roles.cache.find(r => r.name === "Tier 1"),
        twitchSubscriber: message.member.roles.cache.find(r => r.name === "Twitch Subscriber"),
        member: message.member.roles.cache.find(r => r.name === "Member"),
        everyone: message.member.roles.cache.find(r => r.name === "@everyone")
      };
      return memberRoles;
  },
};
