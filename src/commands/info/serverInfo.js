
module.exports = async (msg) => {
    await msg.channel.send(`This server's name is: ${msg.guild.name}\nTotal Members: ${msg.guild.memberCount}`);
    console.log("Server Info response sent!");
};