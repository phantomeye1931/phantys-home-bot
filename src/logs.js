async function getLogChannel() {
  const phGuild = await require("./guild");
  return await phGuild.channels.fetch(process.env.LOG_CHANNEL_ID.toString());
}

function formatMessage(message) {
  return '> **\`' + message.replace('\n', ' ') + '\`**';
}

async function logMessage(message) {
  const logChannel = await getLogChannel();
  await logChannel.send(formatMessage(message));
}

async function directReply(message, response) {
  await message.reply(formatMessage(response.replace(/\n/g, " ")));
}

async function logError(error) {
  const logChannel = await getLogChannel();
  if (error.code && error.message)
    await logChannel.send(formatMessage(`❌ An error occured: ${error.code} - ${error.message.trim()}`));
  else
    await logChannel.send(formatMessage(`❌ An error occured: ${error.trim()}`));
}

module.exports = { 
  logMessage, 
  directReply,
  logError,
  formatMessage
};