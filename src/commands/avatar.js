module.exports = async (msg) => {
    if (!msg.mentions.users.size) {
        console.log("An avatar was summoned!");
		return msg.channel.send(`Your avatar: <${msg.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
	}

	const avatarList = msg.mentions.users.map(user => {
		return `${user.username}'s avatar: <${user.displayAvatarURL({ format: "png", dynamic: true })}>`;
	});

    console.log(`${avatarList.length} avatars were summoned!`);

	// send the entire array of strings as a msg
	// by default, discord.js will `.join()` the array with `\n`
	msg.channel.send(avatarList);
};
/*
[MULLIGAN]
Oh my God. Tear this dude apart

[SEABURY]
Chaos and bloodshed are not a solution
Don’t let them lead you astray
This Congress does not speak for me
*/