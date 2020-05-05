module.exports = async (msg, args) => {

    const amount = parseInt(args[0]) + 1;

	if (isNaN(amount)) {
        console.log("Tried to Prune stuff but not valid!");
        return msg.channel.send('That doesn\'t seem to be a valid number.');
    } else if (amount <= 1 || amount > 100) {
        console.log("Tried to Prune stuff but number is too high or low");
        return msg.channel.send('You need to input a number between 1 and 99.');
    }
    
    console.log(`Pruned ${amount} number of messages!`);

    msg.channel.bulkDelete(amount, true).catch(err => {
        console.error(err);
        msg.channel.send('There was an error trying to prune messages in this channel!');
    });
};