const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const cron = require("node-cron");

const logs = require("./logs");
const messageHandler =     require("./functions/messageHandler");
const dmMessageHandler =   require("./functions/dmMessageHandler");
const interactionHandler = require("./functions/interactionHandler");
const reactionHandler =    require("./functions/reactionHandler");
const registerSlashCommands = require("./registerSlashCommands");

const onReady = require("./events/ready");
const daily = require("./events/daily");

const emojis = require("./emojis.js");
const { eventNames } = require("process");

registerSlashCommands.register();

(async () => {
  const client = await require("./client");
  client.once(onReady.name, (...args) => onReady.execute(...args));

  client.on("messageCreate", async (message) => { // DM messages
    try {
      if (message.author.bot || message.guild) return; // Ensure the bot doesn't reply to bots, or server messages
      dmMessageHandler.handleDM(message);
    } catch (error) {
      logs.logError(error);
    }
  });

  reactionChannels = [ // [channelID, reactLikeToImages, reactLike, reactVotes]
    ['1235600733093761156', false, true,  false], // Dev announcements
    ['1253797518555353239', false, true,  true ], // Dev updates
    ['1235600701602791455', true,  false, false], // Dev art

    ['878221699844309033',  false, true,  false], // #News
    ['876132326101360670',  false, true,  false], // #Announcements
    ['981527027142262824',  true,  false, false], // #Art
    ['1005103628882804776', false, true,  true ]  // #Updates
  ]

  client.on("messageCreate", async (message) => {
    if (!message.author.bot && message.guild)  { // Reactions
      for (i in reactionChannels) {
        reactionChannel = reactionChannels[i];

        if (reactionChannel[0] != message.channelId) continue;
        reactionHandler.react(message, reactionChannel);
      }
    }
  });

  client.on("messageReactionAdd", async (messageReaction, author) => {
    const message = await messageReaction.message.channel.messages.fetch(messageReaction.message.id); // Fetch message in channel by ID
    const authorID = message.author.id;

    inArtChannel = ['981527027142262824', '1235600701602791455'].includes(messageReaction.message.channelId);
    bySameUser = author.id == authorID;
    isDeleteReaction = ['1265683388069707776', '1264171028125323327'].includes(messageReaction.emoji.id);

    if (inArtChannel && isDeleteReaction) {
      reactionHandler.removeReactions(messageReaction, bySameUser);
    }
  });

  client.on('interactionCreate', async interaction => { // Slash commands
    try {
      if (!interaction.isCommand()) return;
      interactionHandler.reply(interaction);
    } catch (error) {
      logs.logError(error);
    }
  });

})();

// daily.run();

// Increment the boosting value of all boosters everyday at 12 PM CEST
cron.schedule(
  "00 00 12 * * 0-6",
  () => {
    daily.run();
  },
  {
    timezone: "Europe/Amsterdam",
  }
);

process.on('uncaughtException', (error) => { // Error logging
  console.error('Uncaught Exception:', error);
});