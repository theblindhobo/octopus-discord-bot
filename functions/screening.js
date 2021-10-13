const { channelId, theblindhobo } = require('../config.json');


var interactionTimeout = {};
var timedOut = [];
var myTimeOut;
const interactionAdd = (interaction) => {
  if(Object.keys(interactionTimeout).includes(interaction.user.id)) {
    interactionTimeout[interaction.user.id]++;
  } else if(!Object.keys(interactionTimeout).includes(interaction.user.id)) {
    interactionTimeout[interaction.user.id] = 0;
  }
};
const removingInt = (interaction) => {
  const index = timedOut.indexOf(interaction.user.id);
  if (index > -1) {
    timedOut.splice(index, 1);
  }
  delete interactionTimeout[interaction.user.id];
  console.log(`SCREENING: Removed the timeout for User ${interaction.user.id}.`);
};
const removeIntTimeOut = (interaction) => {
  myTimeOut = setTimeout(function() {
    removingInt(interaction);
  }, 2 * 60 * 1000); // Remove timeout in 2 mins
};

// logging
const logInt = (interaction, hasMemberRole) => {
  let memberStatus;
  if(!hasMemberRole && interaction.customId === 'agree') {
    memberStatus = 'Became member.';
  } else if(!hasMemberRole && interaction.customId === 'disagree') {
    memberStatus = 'Declined member status.';
  } else if(hasMemberRole && interaction.customId === 'agree') {
    memberStatus = 'Already a member.';
  } else if(hasMemberRole && interaction.customId === 'disagree') {
    memberStatus = 'Already a member.';
  } else {
    memberStatus = undefined;
  }
  interaction.message.guild.channels.cache
      .find(channel => channel.id === channelId.logger)
      .send(`<@${interaction.user.id}> clicked **${interaction.customId}** button. (${memberStatus})`);
};

module.exports = {
  async agree(interaction, hasMemberRole) {
    if(!hasMemberRole) {
      if(timedOut.includes(interaction.user.id)) {
        clearTimeout(myTimeOut);
        removingInt(interaction);
      }
      interactionAdd(interaction);
      const welcomeDM = `Welcome <@${interaction.user.id}> to the Octopus Recordings discord server.\n\nIf you'd like to submit a demo to the label, please navigate to <#${channelId.demoGuidelines}> to read about the guideline first. Then you may submit your demo in the <#${channelId.demoSubmissions}> channel.\n\nOr, just check out Octopus Recordings <#${channelId.generalChat}> chat.`;
      try {
        await interaction.reply({ content: `<@${interaction.user.id}> You selected agree! You should now be able to access the rest of the server. Welcome!!`, ephemeral: true});
        await interaction.member.roles.add(interaction.guild.roles.cache.find(r => r.name === 'Member'));
        await interaction.member.guild.members.cache.get(interaction.user.id).send(welcomeDM)
                  .catch(() => console.log(`DM: USER DOES NOT ACCEPT DIRECT MESSAGES!`));
        await logInt(interaction, hasMemberRole);
      } catch(error) {
        console.log(error);
        console.log(`Something weird happened! Error:01`);
      }
    } else if(!timedOut.includes(interaction.user.id)) {
      if(interactionTimeout[interaction.user.id] > 0) {
        timedOut.push(interaction.user.id);
        removeIntTimeOut(interaction);
        if(!hasMemberRole) {
          await interaction.reply({ content: `<@${interaction.user.id}> You are currently timed out for clicking too much! Try again in a little bit.`, ephemeral: true });
          console.log(`SCREENING: User ${interaction.user.id} has been timed out for 2mins.`);
        } else {
          await interaction.reply({ content: `<@${interaction.user.id}> You already have Member role, please stop clicking these buttons. You are at risk of being banned!`, ephemeral: true });
          console.log(`SCREENING: User ${interaction.user.id} has been timed out for 2mins.`);
        }
      } else {
         if(hasMemberRole) {
          interactionAdd(interaction);
          try {
            await interaction.reply({ content: `<@${interaction.user.id}> You already have the Member role. Please stop clicking these buttons!!`, ephemeral: true});
            await logInt(interaction, hasMemberRole);
          } catch(error) {
            console.log(error);
            console.log(`Something weird happened! Error:02`);
          }
        } else {
          interactionAdd(interaction);
          try {
            await console.log(`Something weird happened! Error:03`);
            await logInt(interaction, hasMemberRole);
          } catch(error) {
            console.log(error);
            console.log(`Something weird happened! Error:04`);
          }
        }
      }
    } else {
      if(!hasMemberRole) {
        await interaction.reply({ content: `<@${interaction.user.id}> You are currently timed out for clicking too much! If you're experencing issues, please DM <@${theblindhobo}>.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `<@${interaction.user.id}> You already have Member role, please stop clicking these buttons. You are at risk of being banned!`, ephemeral: true });
      }
    }
  },
  async disagree(interaction, hasMemberRole) {
    if(!timedOut.includes(interaction.user.id)) {
      if(interactionTimeout[interaction.user.id] > 0) {
        timedOut.push(interaction.user.id);
        removeIntTimeOut(interaction);
        if(!hasMemberRole) {
          await interaction.reply({ content: `<@${interaction.user.id}> You are currently timed out for clicking too much! Try again in a little bit, or you can click **agree** now to join the server.`, ephemeral: true });
          console.log(`SCREENING: User ${interaction.user.id} has been timed out for 2mins.`);
        } else {
          await interaction.reply({ content: `<@${interaction.user.id}> You already have Member role, please stop clicking these buttons. You are at risk of being banned!`, ephemeral: true });
          console.log(`SCREENING: User ${interaction.user.id} has been timed out for 2mins.`);
        }
      } else {
        if(!hasMemberRole) {
          interactionAdd(interaction);
          try {
            await interaction.reply({ content: `I'm sorry <@${interaction.user.id}>, you'll have to agree before entering this server.`, ephemeral: true});
            await logInt(interaction, hasMemberRole);
          } catch(error) {
            console.log(error);
            console.log(`Something weird happened! Error:05`);
          }
        } else if(hasMemberRole) {
          interactionAdd(interaction);
          try {
            await interaction.reply({ content: `<@${interaction.user.id}> You already have the Member role. Please stop clicking these buttons!!`, ephemeral: true});
            await logInt(interaction, hasMemberRole);
          } catch(error) {
            console.log(error);
            console.log(`Something weird happened! Error:06`);
          }
        } else {
          interactionAdd(interaction);
          try {
            await console.log(`Something weird happened! Error:07`);
            await logInt(interaction, hasMemberRole);
          } catch(error) {
            console.log(error);
            console.log(`Something weird happened! Error:08`);
          }
        }
      }
    } else {
      if(!hasMemberRole) {
        await interaction.reply({ content: `<@${interaction.user.id}> You are currently timed out for clicking too much! Try again in a little bit, or you can click **agree** now to join the server.`, ephemeral: true });
      } else {
        await interaction.reply({ content: `<@${interaction.user.id}> You already have Member role, please stop clicking these buttons. You are at risk of being banned!`, ephemeral: true });
      }
    }
  },
}
