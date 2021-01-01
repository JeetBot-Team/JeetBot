const patpat = [
	"Hang in there.",
	"Don't give up.",
	"Stay strong.",
	"Never give up.",
	"I believe in you!",
	"I will support you whatever the circumstance may be.",
	"I am behind you 100%.",
    "Follow your dreams.",
    "We can do no great things, only small things with great love.",
    "No one has ever become poor by giving.",
    "I have learned over the years that when one’s mind is made up, this diminishes fear; knowing what must be done does away with fear.",
    "You may not be perfect, but parts of you are pretty awesome.",
    "If you obey all the rules, you miss all the fun.",
    "I don’t think of all the misery but of the beauty that still remains.",
    "When you notice that you’re having negative thoughts about how all of this is going to pan out, you need to remind yourself that you are not a very good fortune teller.",
    "Doing the best at this moment puts you in the best place for the next moment."
];

module.exports = async (msg, args) => {
    if (!args.length) return;
    
    const i = Math.floor(Math.random() * patpat.length);
    const reply = patpat[i];

    const taggedUser = msg.mentions.users.first();

    if(taggedUser) {
        await msg.channel.send(`${taggedUser.username}, ${reply} 💖`);
    } else {
        await msg.channel.send(`${reply} 💖`);
    }
    
	console.log("Jeet encouraged someone: ", reply);
};