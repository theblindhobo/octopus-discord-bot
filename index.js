const { Client, Intents } = require('discord.js');
const fs = require('fs');
const app = require('express')();

require('dotenv').config();

const intents = [
  "GUILDS", "GUILD_MEMBERS", "GUILD_PRESENCES",
  "GUILD_MESSAGES", "DIRECT_MESSAGES"
];
const client = new Client({ intents: intents});
module.exports = { client };


app.set('port', (process.env.PORT || 5000));
// For avoiding Heroku $PORT error
app.get('/', function(request, response) {
  var result = 'App is running.';
  response.send(result);
}).listen(app.get('port'), function() {
  console.log('App is running, server is listening on port ', app.get('port'));
});


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for(const file of eventFiles) {
  const event = require(`./events/${file}`);
  if(event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}


client.login(process.env.TOKEN);
