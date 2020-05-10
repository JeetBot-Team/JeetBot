
module.exports = async (msg) => {

    if (!msg.mentions.users.size) {
        console.log('Moderator did not tag a user when using mute function')
        return msg.channel.send('You need to tag a user in order to mute them!');
    }

    const person = msg.guild.member(msg.mentions.users.first()); 
    
    let role = await msg.guild.roles.cache.find(role => role.name === "mute");
    if (!role) return msg.channel.send('Could not find the mute role');
    
    await person.roles.add(role.id);

    const taggedUser = msg.mentions.users.first();

    await msg.channel.send(`You have muted ${taggedUser}`);
    console.log('Moderator has muted someone!');
};

/*
[ELIZA]
Take a break

[HAMILTON]
Hey, our kid is pretty great

[ELIZA]
Run away with us for the summer
Let’s go upstate

[HAMILTON]
Eliza, I’ve got so much on my plate

[ELIZA]
We can all go stay with my father
There’s a lake I know…
*/