const commandHandler = require(`../../../src/commands/index.js`);

describe(`Fun Command: `, () => {
  // mock the message object
  const msg = {
    channel: {
      send: jest.fn(),
    },
    content: ``,
    author: {
      id: "user-id",
      username: "user username",
      discriminator: "user#0000",
      avatar: "user avatar url",     
      bot: false
    },
    mentions: {
      users: {
        first: jest.fn()
      }
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`8ball`, async () => {
    msg.content = `j.8ball is this test working?`;

    const eightBallPhrases = [
      `As I see it, yes.`,
      `Ask again later.`,
      `Better not tell you now.`,
      `Cannot predict now.`,
      `Concentrate and ask again`,
      `Don't count on it.`,
      `It is certain.`,
      `It is decidedly so.`,
    ];

    // run the command
    await commandHandler(msg);

    // ensure that only one of the 8 commands comes back
    let reply;

    for(let phrase of eightBallPhrases) {
      if(msg.channel.send.mock.calls[0][0].includes(phrase)) {
        reply = phrase;
      }
    }

    expect(msg.channel.send).toHaveBeenCalled();
    expect(msg.channel.send).toHaveBeenCalledWith(`${msg.author} ${reply} 🎱`);
  });

  test(`dice`, async () => {
    msg.content = `j.dice`;

    await commandHandler(msg);

    let i

    for(let num = 0; num <= 20; num++) {
     if(msg.channel.send.mock.calls[0][0].includes(num)) {
        i = num;
     } 
    }

    expect(msg.channel.send).toHaveBeenCalled();
    expect(msg.channel.send).toHaveBeenCalledWith(`${msg.author} you got this roll: ${i} 🎲`)    
  });

  test(`patpat`, async () => {
    msg.content = `j.patpat test`;
    
    const patpatPhrases = [
      `Hang in there.`,
      `Don't give up.`,
      `Stay strong.`,
      `Never give up.`,
      `I believe in you!`,
      `I will support you whatever the circumstance may be.`,
      `I am behind you 100%.`,
      `Follow your dreams.`,
      `We can do no great things, only small things with great love.`,
      `No one has ever become poor by giving.`,
      `I have learned over the years that when one’s mind is made up, this diminishes fear; knowing what must be done does away with fear.`,
      `You may not be perfect, but parts of you are pretty awesome.`,
      `If you obey all the rules, you miss all the fun.`,
      `I don’t think of all the misery but of the beauty that still remains.`,
      `When you notice that you’re having negative thoughts about how all of this is going to pan out, you need to remind yourself that you are not a very good fortune teller.`,
      `Doing the best at this moment puts you in the best place for the next moment.`,
    ];

    await commandHandler(msg);

    let reply;

    for(let phrase of patpatPhrases) {
      if(msg.channel.send.mock.calls[0][0].includes(phrase)) {
        reply = phrase;
      }
    }

    expect(msg.channel.send).toHaveBeenCalled();
    expect(msg.channel.send).toHaveBeenCalledWith(`${reply} 💖`);

    // need to include a test when j.patpat @user#0001
  });
});
