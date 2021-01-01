
module.exports = async (msg) => {
    await msg.channel.send(`Your username: ${msg.author.username}\nYour ID: ${msg.author.id}`);
    console.log("User Info response sent!");
};