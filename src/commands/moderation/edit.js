const Discord = require("discord.js");
const ServerInfo = require("../../database/models/dbdiscordserverinfo");
const { guildWelcomeMessageUpdated } = require("../../redux/guildsSlice");

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission(["MANAGE_MESSAGES"])) {
    console.log(
      `${msg.author.username} can manage messages from Discord Server: ${msg.guild}`
    );

    msg.channel.send(
      `${msg.author}, what would you like your welcome message to be?\n(Don't forget to end your welcome message with j.end)`
    );
    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on("collect", async (m, col) => {
      console.log(
        "\nChannel: " +
          msg.channel.name +
          "\nUser: " +
          m.author.tag +
          "\nMessage: " +
          m.content
      );

      if (msg.author.id === m.author.id && m.content.includes("j.end")) {
        let welcomeMsg = m.content.slice(0, m.content.length - 5);
        console.log(
          "\n** Welcome Message has been collected below**",
          `\n ${welcomeMsg}`
        );

        msg.channel.send(
          `${msg.author}, where would you like the welcome message to go?`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.WelcomeMessage.MessageInfo = welcomeMsg;

        await guildInfo.save();

        let newGuildInfo = JSON.parse(JSON.stringify(guildInfo));
        newGuildInfo._id = newGuildInfo.server_id;
        store.dispatch(guildWelcomeMessageUpdated(newGuildInfo));
      }

      if (msg.author.id === m.author.id && m.content.startsWith("<#")) {
        let channel = m.content.slice(2, m.content.length - 1);

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.WelcomeMessage.WelcomeChannel = channel;

        await guildInfo.save();

        let newGuildInfo = JSON.parse(JSON.stringify(guildInfo));
        newGuildInfo._id = newGuildInfo.server_id;
        store.dispatch(guildWelcomeMessageUpdated(newGuildInfo));

        console.log("Channel has been collected: ", `${channel}`);
        msg.channel.send(`${msg.author}, Thanks I'll remember that!`);
        collector.stop();
      }
    });
  } else {
    console.log("This member cannot edit the welcome message");
    msg.channel.send(
      `${msg.author.username} does not have the authority to edit the welcome message`
    );
  }
};
