
module.exports = async (msg) => {

    if (!msg.mentions.users.size) {
        console.log('Moderator did not tag a user when using kick function')
        return msg.channel.send('You need to tag a user in order to kick them!');
    }

    const taggedUser = msg.mentions.users.first();

    await msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
    console.log('Moderator tried to kick someone!');
};