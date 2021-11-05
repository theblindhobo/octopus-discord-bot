const Discord = require('discord.js');
const fetch = require('node-fetch');

const { client } = require('../index.js');

require('dotenv').config();
const { spotify } = require('../config.json');

const _getAccessToken = async (clientID, clientSecret) => {

  const result = await fetch(`https://accounts.spotify.com/api/token?grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + new Buffer.from(clientID + ':' + clientSecret).toString('base64')
    }
  })
  .then(response => response.json())
  .then(data => {
    return data;
  })
  .catch(error => console.log(error.message));
  const data = await result;
  return data.access_token;
}

const findNewSpotifyReleases = (client, channelID, playlist, clientID, clientSecret) => {
  _getAccessToken(clientID, clientSecret)
    .then(token => {
      const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
      };
      const url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?fields=total,limit`;

      fetch(url, options)
        .then(response => {
          if(response.status === 401) {
            _getAccessToken(clientID, clientSecret)
              .then(token => {
                const options = {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                };
                fetch(url, options)
                  .then(response => {
                    if(response.status === 401) {
                      return console.log('SPOTIFY: FAILING TO CONNECT - NEEDS ATTENTION!');
                    } else if(response.status === 200) {
                      return response;
                    }
                  })
                  .catch(error => console.log(error.message));
              })
              .catch(error => console.log(error.message));
          } else if(response.status === 200) {
            return response;
          }
        })
        .then(response => response.json())
        .then(data => {
          const limit = 50;
          const runFetchPlaylist = (playlist, offset, limit, options) => {
              const url = `https://api.spotify.com/v1/playlists/${playlist}/tracks?offset=${offset}&limit=${limit}`;
              fetch(url, options)
                .then(response => response.json())
                .then(async data => {
                    var albumList = [];
                    for(var i = 0; i < data.items.length; i++) {
                      await albumList.push(data.items[i].track.album.id)
                    }
                    return Promise.all(albumList)
                })
                .then(list => {
                    const checkList = () => {
                      _getAccessToken(clientID, clientSecret)
                        .then(token => {
                            const options = {
                                method: 'GET',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                            };
                            fetch(url, options)
                              .then(response => {
                                if(response.status === 401) {
                                  _getAccessToken(clientID, clientSecret)
                                    .then(token => {
                                        const options = {
                                            method: 'GET',
                                            headers: {
                                              'Authorization': `Bearer ${token}`
                                            }
                                        };
                                        fetch(url, options)
                                          .then(response => {
                                              if(response.status === 401) {
                                                return console.log('SPOTIFY: FAILING TO CONNECT - NEEDS ATTENTION!');
                                              } else if(response.status === 200) {
                                                return response;
                                              }
                                          })
                                          .catch(error => console.log(error.message));
                                    })
                                    .catch(error => console.log(error.message));
                                } else if(response.status === 200) {
                                  return response;
                                }
                              })
                              .then(response => response.json())
                              .then(async data => {
                                  var albumList = [];
                                  for(var i = 0; i < data.items.length; i++) {
                                    await albumList.push(data.items[i].track.album.id);
                                  }
                                  return Promise.all(albumList);
                              })
                              .then(aList => {
                                  if(list !== aList) {
                                    let difference = aList.filter(x => !list.includes(x));
                                    let uniqueAlbums = difference.filter((item, i, ar) => ar.indexOf(item) === i);
                                    if(uniqueAlbums.length === 0) {
                                      return console.log('SPOTIFY: No new releases found at this time.');
                                    } else {
                                      for(var i = 0; i < uniqueAlbums.length; i++) {
                                        fetch(`https://api.spotify.com/v1/albums/${uniqueAlbums[i]}`, options)
                                          .then(response => response.json())
                                          .then(async data => {
                                              await client.channels.fetch(channelID)
                                                      .then(channel => {
                                                        channel.messages.fetch({ limit: 50 })
                                                            .then(messages => {
                                                              var listOfMessages = [];
                                                              var mapMessages = messages.map(message => {
                                                                listOfMessages.push(message.content);
                                                              });
                                                              const allMessages = Promise.all(listOfMessages)
                                                                .then(result => {
                                                                  var isInList = result.find(a => a.includes(data.external_urls.spotify));
                                                                  if(isInList === undefined) {
                                                                    console.log('SPOTIFY: New release found! Posting in channel now.');

                                                                    list.push(data.id);

                                                                    var albumObj = {
                                                                      artists: [],
                                                                      tracks: [],
                                                                    };

                                                                    for(var i = 0; i < data.artists.length; i++) {
                                                                      albumObj.artists.push(data.artists[i].name)
                                                                    }

                                                                    const allArtists = Promise.all(albumObj.artists)
                                                                        .then(async result => {
                                                                          albumObj.artists = await result;
                                                                        })
                                                                        .catch(error => console.log(error.message));

                                                                    albumObj.url = data.external_urls.spotify;
                                                                    albumObj.image = data.images[0].url;
                                                                    albumObj.label = data.label;
                                                                    albumObj.albumName = data.name;
                                                                    albumObj.releaseDate = data.release_date;
                                                                    albumObj.totalTracks = data.total_tracks;
                                                                    albumObj.type = data.album_type; // single or comp

                                                                    if(albumObj.type === 'compilation') {
                                                                      for(var i = 0; i < data.total_tracks; i++) {
                                                                        albumObj.tracks.push(`${data.tracks.items[i].track_number}) ${data.tracks.items[i].name} - **${data.tracks.items[i].artists[0].name}**`);
                                                                      }
                                                                      const allTracks = Promise.all(albumObj.tracks)
                                                                          .then(async result => {
                                                                            const albumEmbed = new Discord.MessageEmbed()
                                                                                .setColor('#1DB954')
                                                                                .setTitle(albumObj.albumName)
                                                                                .setURL(albumObj.url)
                                                                                .setAuthor('Compilation: ' + albumObj.artists.join(', '))
                                                                                .setDescription(await result.join('\n'))
                                                                                // .setThumbnail(newestEntry.logo)
                                                                                .setThumbnail(albumObj.image)
                                                                                .setFooter(`Release date: ${albumObj.releaseDate}`);

                                                                            return channel.send({ content: `New release on Spotify: <${albumObj.url}>`, embeds: [albumEmbed] });
                                                                          })
                                                                          .catch(error => console.log(error.message));
                                                                    } else if(albumObj.type !== 'compilation') {
                                                                        for(var i = 0; i < data.total_tracks; i++) {
                                                                          albumObj.tracks.push(`${data.tracks.items[i].track_number}) ${data.tracks.items[i].name}`);
                                                                        }
                                                                        const allTracks = Promise.all(albumObj.tracks)
                                                                            .then(async result => {
                                                                              const albumEmbed = new Discord.MessageEmbed()
                                                                                  .setColor('#1DB954')
                                                                                  .setTitle(albumObj.albumName)
                                                                                  .setURL(albumObj.url)
                                                                                  .setAuthor(albumObj.artists.join(', '))
                                                                                  .setDescription(await result.join('\n'))
                                                                                  // .setThumbnail(newestEntry.logo)
                                                                                  .setThumbnail(albumObj.image)
                                                                                  .setFooter(`Release date: ${albumObj.releaseDate}`);
                                                                              return channel.send({ content: `New release on Spotify: <${albumObj.url}>`, embeds: [albumEmbed] });
                                                                            })
                                                                            .catch(error => console.log(error.message));
                                                                    }
                                                                  } else if(isInList !== undefined) {
                                                                    list.push(data.id);
                                                                    return console.log('SPOTIFY: Bot already posted this Spotify release before.');
                                                                  }
                                                                })
                                                                .catch(error => console.log(error.message));
                                                            })
                                                            .catch(error => console.log(error.message));
                                                      })
                                                      .catch(error => console.log(error.message));
                                          })
                                          .catch(error => console.log(error.message));
                                      }
                                    }
                                  }
                              })
                              .catch(error => console.log(error.message));
                        })
                        .catch(error => console.log(error.message));
                    };
                    const runQuerySpotify = () => {
                      checkList();
                      let i = 0;
                      const intervalID = setInterval(function() {
                        if(i < 24) {
                          i += 1;
                          checkList();
                        } else {
                          clearInterval(intervalID);
                          i = 0;
                        }
                      }, 3600000); // Hourly
                    };
                    runQuerySpotify();
                })
                .catch(error => console.log(error.message));
          };

          if(data.total > 50) {
            const offset = data.total - 50;
            runFetchPlaylist(playlist, offset, limit, options);
          } else if(data.total <= 50) {
            const offset = 0;
            runFetchPlaylist(playlist, offset, limit, options);
          }
        })
        .catch(error => console.log(error.message));
    })
    .catch(error => console.log(error.message));
};

const runRefreshListSpotify = () => {
  return findNewSpotifyReleases(client, spotify.channel, process.env.SPOTIFY_PLAYLIST, process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
};

module.exports = { runRefreshListSpotify };
