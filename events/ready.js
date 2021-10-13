const { runRefreshListSpotify } = require('../functions/spotify.js');
const { runQueryMixcloud } = require('../functions/mixcloud.js');

let turnOnOff = true;

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}.`);


    if(turnOnOff) {
      // MIXCLOUD
      runQueryMixcloud();
      setInterval(runQueryMixcloud, 3600000); // Hourly

      // SPOTIFY
      setTimeout(() => {
        runRefreshListSpotify();
        setInterval(runRefreshListSpotify, 86400000); // Daily
      }, 10000);
    }

  },
};
