
module.exports = async (msg) => {

    if (!msg.mentions.users.size) {
        console.log('Moderator did not tag a user when using kick function')
        return msg.channel.send('You need to tag a user in order to kick them!');
    }

    const taggedMember = msg.mentions.members.first();

    await msg.channel.send(`You kicked ${taggedMember}`);
    taggedMember.kick();
    console.log('Moderator has kick someone!');
};