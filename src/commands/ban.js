module.exports = async (msg) => {

    /*
        Future to add:
          Error handling to check if user has permissions to use this
    */

    if (!msg.mentions.users.size) {
        console.log('Moderator did not tag a user when using ban function')
        return msg.channel.send('You need to tag a user in order to ban them!');
    }

    const taggedUser = msg.mentions.users.first();

    msg.channel.send(`You banned ${taggedUser.username}`);
    msg.guild.members.ban(taggedUser);

    console.log('Moderator has banned someone!');
};