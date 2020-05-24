module.exports = async (msg) => {

    if(msg.member.hasPermission(['KICK_MEMBERS'])) {
        console.log(`${msg.author.username} can kick people from Discord Server: ${msg.guild}`);
        if (!msg.mentions.users.size) {
            console.log('Moderator did not tag a user when using kick function')
            return msg.channel.send('You need to tag a user in order to kick them!');
        }

        const taggedUser = msg.mentions.users.first();

        msg.channel.send(`You kicked ${taggedUser.username}`);
        taggedUser.kick();

        console.log(`Moderator ${msg.author.username} has kicked ${taggedUser} from ${msg.guild}!`);
    } else {
        console.log('This member cannot kick members');
        return msg.channel.send(`${msg.author.username} does not have the authority to kick someone`);
    }    
};

/*
[LAFAYETTE]
Raise a glass to freedom

[LAURENS/MULLIGAN]
Hey!
Something you will never see again!

[MULLIGAN]
No matter what she tells you
*/