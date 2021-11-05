const { runRefreshListSpotify } = require('../functions/spotify.js');
const { runQueryMixcloud } = require('../functions/mixcloud.js');

let turnOnOff = true;

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}.`);

    require('../functions/memberCount.js').execute(client);


    if(turnOnOff) {
      // MIXCLOUD
      runQueryMixcloud();
      setInterval(runQueryMixcloud, 5 * 60 * 1000); // 5mins


      // SPOTIFY - Checks every 5mins, and clears interval after an hour, resets list hourly
      setTimeout(() => {
        runRefreshListSpotify();
        setInterval(runRefreshListSpotify, 60 * 60 * 1000); // Hourly
      }, 10 * 1000);

    }

  },
};
