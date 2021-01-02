const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { guildRoleEmojiUpdated } = require(`../../redux/guildsSlice`);
const { serverCache } = require(`../../utils/botUtils`);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`MANAGE_ROLES`])) {
    console.log(
      `${msg.author.username} can add roles and add emojis from Discord Server: ${msg.guild}`
    );

    msg.channel.send(
      `${msg.author}, which message would you like to use for your role reactions?\nCopy the ID of the message you want to use.`
    );
    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      console.log(
        `\nChannel: ` +
          msg.channel.name +
          `\nUser: ` +
          m.author.tag +
          `\nMessage: ` +
          m.content
      );

      if (msg.author.id === m.author.id && !isNaN(m.content)) {
        let roleEmojiMsgId = m.content.slice(0);

        console.log(
          `roleEmojiMsgId has been collected below`,
          `\n ${roleEmojiMsgId}`
        );

        msg.channel.send(
          `${msg.author}, What emoji and role would you like to bind to the message?\n Please enter the emoji you would like to use & tag the role you would like to bind the emoji to.\nYou can only enter one emoji role mapping at a time.\nType in j.stop when you're finished.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.RoleReactions.Message_ID = roleEmojiMsgId;

        store.dispatch(guildRoleEmojiUpdated(serverCache(guildInfo)));
        await guildInfo.save();
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`<:`)) {
        let roleEmojiMapping = m.content.slice(2, m.content.length - 1);
        let emojiID = roleEmojiMapping.slice(
          roleEmojiMapping.indexOf(`:`) + 1,
          roleEmojiMapping.indexOf(`>`)
        );
        let roleID = roleEmojiMapping.slice(roleEmojiMapping.indexOf(`&`) + 1);

        console.log(`This is the Role Emoji Mapping: `, roleEmojiMapping);
        console.log(`This is the Emoji ID: `, emojiID);
        console.log(`This is the Role ID `, roleID);

        msg.channel.send(
          `I've collected an emoji and role! Type j.stop if you're done, otherwise keep adding roles.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        let roleEmojiObj = {
          [emojiID]: roleID,
        };

        if (guildInfo.RoleReactions.RoleMappings) {
          for (let key in guildInfo.RoleReactions.RoleMappings) {
            if (guildInfo.RoleReactions.RoleMappings[key] === roleID) {
              msg.channel.send(
                `${msg.author}, that role emoji mapping exists! Please enter a new one.`
              );
              return;
            }
          }

          guildInfo.RoleReactions.RoleMappings.push(roleEmojiObj);
        } else if (!guildInfo.RoleReactions.RoleMappings) {
          guildInfo.RoleReactions.RoleMappings = roleEmojiObj;
        }

        try {
          await guildInfo.save();
          console.log(`We've saved the role emoji into the Database`);
        } catch (err) {
          console.log(err);
        }
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.stop`)) {
        msg.channel.send(
          `${msg.author}, I've stopped collecting role reaction messages.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        store.dispatch(guildRoleEmojiUpdated(serverCache(guildInfo)));
        collector.stop();
      }
    });
  } else {
    console.log(`This member cannot add emoji role mappings`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to edit the role emoji mappings`
    );
  }
};
