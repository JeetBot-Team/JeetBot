const dice = require(`../../../src/commands/fun/dice`);
const patpat = require(`../../../src/commands/fun/patpat`);
const commandHandler = require(`../../../src/commands/index.js`);

describe(`Fun Command: `, () => {
  // mock the message object
  const msg = {
    channel: {
      send: jest.fn(),
    },
    content: ``,
    author: {
      bot: false,
    },
  };

  // const args = ['sample', 'argument']

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`8ball`, async () => {
    msg.content = `j.8ball is this test working?`;

    const eightBall = [
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
    expect(msg.channel.send).toHaveBeenCalled();
    console.log(msg.channel.send);
    // expect(msg.channel.send).toHaveBeenCalledWith(`${msg.author} ${eightBall} 🎱`)

    // test to run with something else that's not within the expected response
  });

  test(`dice`, async () => {
    // mock dice
    // mock message object
    // run command
    // should expect an int to come back between 1-20 ?
  });

  test(`patpat`, async () => {
    // call the command
    // run command
    // should come back with expected response
  });
});
