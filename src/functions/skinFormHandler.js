require("../envloader");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const minecraft = require("../functions/minecraftAPIhandler");

const emojis = require("../consts/emojis.js");
const colors = require("../consts/colors.js");
const logs = require("../logs.js");

const messages = {
  blank:   ``,
  booster: `It seems like you've**${emojis.booster}boosted** Phanty's Home for **3 months**! Thank you so much!`,
  translator: `Hey! Thanks for helping us**${emojis.translator}translate** PortalMod. As a little thank you, we'd like to give you a Portal Gun skin.`,
  birthday: `Hey! **Happy birthday 🍰🎉!!!**\nWe've got a (permanent) birthday Portal Gun skin for you to link to your account!`,
}

const formTitle = { 
  name: "PortalMod Portal Gun skin form", 
  iconURL: 'https://portalmod.net/images/logo/mark.png' 
}


async function respond(previousField, fieldValue, type = 'blank') {
  const form_1 = new EmbedBuilder().setColor(colors.Primary)
	.setAuthor(formTitle)
  .setDescription(
`Hi!

${messages[type]}

In order to apply your Portal Gun skin to your Minecraft account, we need your Minecraft username. **Please send your username in plain text below**.`
  )
  .setFooter({text: `field 1/2 • skin.${type}`})
  .setTimestamp();

  if (previousField == -1) {
    return form_1; // Send first form message if there hasn't been prior form messages.

  } else if (previousField == 1) {

    uuid = (await minecraft.getUuid(fieldValue))[0];
    username = (await minecraft.getUuid(fieldValue))[1];

    // console.log(uuid);
    if (!(/^[\w-]+$/.test(fieldValue)) || !(2 < fieldValue.length < 17)) {
      const form_1_error_1 = new EmbedBuilder().setColor(colors.Error)
        .setAuthor(formTitle)
        .setDescription("I didn't quite catch that. Please enter your Minecraft: Java Edition username in plain text.")
        .setFooter({text: `field 1/2 • skin.${type} • syntax error`})
        .setTimestamp();
      return [form_1_error_1];

    } else if (typeof uuid !== "undefined") {
      const link = await minecraft.getSkin(uuid);
      // console.log(link);
      const form_2 = new EmbedBuilder().setColor(colors.Primary)
        .setAuthor(formTitle)
        .setDescription("Great! Please confirm that the Minecraft account below is your account by sending '**confirm**'. Otherwise send '**change**' to change it.")
        .setFooter({text: `field 2/2 • skin.${type}`})
        .setTimestamp();
      const form_profile = new EmbedBuilder().setColor(colors.Secondary)
        .setThumbnail(link)
        .setDescription(
`# ${username}
(\`UUID: ${uuid}\`)`
        );

      return [form_2, form_profile];
    } else {
      const form_1_error_2 = new EmbedBuilder().setColor(colors.Error)
        .setAuthor(formTitle)
        .setDescription(`I **couldn't find a player** with the name **${fieldValue}**. Please make sure you've spelled it correctly and it's a Minecraft: Java Edition account. If this still doesn't work, try your UUID instead (you can find this on namemc.com).`)
        .setFooter({text: `field 1/2 • skin.${type} • not found`})
        .setTimestamp();
      return [form_1_error_2];
    }
  } else if (previousField == 2) {
    if (fieldValue == "confirm") {
      const form_3 = new EmbedBuilder().setColor(colors.Primary)
        .setAuthor(formTitle)
        // .setThumbnail(link)
        .setDescription("Perfect! Your Portal Gun skin has been linked to this Minecraft account. Thank you for your support!!")
        .setFooter({text: "form complete"})
        .setTimestamp();
      return [form_3];
      
    } else if (fieldValue == "change") {
      const form_2_reset = new EmbedBuilder().setColor(colors.Primary)
        .setAuthor(formTitle)
        .setDescription("Alright, what is the username of the account you would like to change it to? If you get the incorrect account, try your UUID instead (you can find this on [namemc.com](https://namemc.com/))")
        .setFooter({text: `field 1/2 • skin.${type} • reset`})
        .setTimestamp();
      return [form_2_reset];

    } else {
      const form_2_error_1 = new EmbedBuilder().setColor(colors.Error)
        .setAuthor(formTitle)
        .setDescription("I don't understand that answer. Please reply with either '**confirm**' or '**change**' to confirm or change your submitted username.")
        .setFooter({text: `field 2/2 • skin.${type} • syntax error`})
        .setTimestamp();
      return [form_2_error_1];
    }
  }
}

async function sendFormMessage(targetUser, previousField, fieldValue, retried = false) {
  const client = await require("../client");

  try {    
    // throw { code: 50007, message: "Emulated DM error" };
    await targetUser.send({ embeds: [await respond(previousField, fieldValue, fieldValue) ] });
    return true;

  } catch (error) { // Unable to DM

    console.error(error);
    logs.logMessage(`🎭 Ran into an issue DM'ing \`${targetUser}\`.`);

    if (!retried) { // Error: "Cannot send messages to this user"

      const channel = await client.channels.fetch(process.env.EXCLUSIVE_CHANNEL_ID);

      logs.logMessage(`🔁 Asking them to retry in \`${channel}\`.`);
      const couldnt_dm_error = new EmbedBuilder().setColor(colors.Error)
        .setAuthor(formTitle)
        .setDescription(`${targetUser} It seems **I couldn't DM you** for your ${fieldValue.replace(/^\w/, (c) => c.toUpperCase())} Portal Gun skin! \n\nCould you try (temporarily) changing your **Privacy Settings** on this server? \n(Right click the server icon)`)
        .setFooter({text: `skin.${fieldValue} • DM error (${error.code})`})
        .setTimestamp();
      
      const retry = new ButtonBuilder()
        .setCustomId('functions.skinFormHandler#retry')
        .setLabel(`Retry`)
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary);
      
      const buttons = new ActionRowBuilder()
        .addComponents(retry);
      
      channel.send({ content: `${targetUser}`, embeds: [couldnt_dm_error], components: [buttons] });
      return false;
    }
  }
  return false;
}

async function buttonPressed(buttonID, interaction) {
  if (!interaction.message.content.includes(interaction.user.id)) {
      interaction.deferUpdate();
      // interaction.reply({
      //     embeds: [
      //         new EmbedBuilder().setColor(colors.Error)
      //             .setAuthor(formTitle)
      //             .setDescription(`Hey! You're not the addressed user!\nYou wouldn't pirate a Portal Gun skin now would you?`)
      //             .setFooter({text: `skins • denied`})
      //             .setTimestamp()
      //     ],
      //     ephemeral: true
      // })
      return;
  }

  newTargetUser = interaction.user;
  newFieldValue = interaction.message.embeds[0].data.footer.text.split('.')[1].split(' ')[0];

  if (buttonID == 'retry') {
    if (await sendFormMessage(newTargetUser, -1, newFieldValue, true)) {
      interaction.message.delete();
    } else {
      interaction.reply({
        embeds: [
          new EmbedBuilder().setColor(colors.Error)
            .setAuthor(formTitle)
            .setDescription(`It seems I still wasn't able to message you, please try again! \nIf this issue persists please notify **\`@phantomeye\`**.`)
            .setFooter({text: `skin.${newFieldValue} • message error`})
            .setTimestamp()
        ],
        ephemeral: true
      })
    }
  }
}

module.exports = { respond, sendFormMessage, buttonPressed };