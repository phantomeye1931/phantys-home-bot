const skinForm = require('../../functions/skinFormHandler');
const logs     = require('../../logs');
const skins    = require('../../consts/gun_skins');

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function init() {
  return new SlashCommandBuilder().setName('skin_prompt')
  .setDescription('DM user a skin form')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addUserOption(option =>
    option.setName('user')
      .setRequired(true)
      .setDescription('User to DM the Portal Gun skin form')
  )
  .addStringOption(option => 
    option.setName('skin_type')
      .setDescription('The Portal Gun skin to give')
      .setRequired(true)
      .addChoices(
        {name: 'Booster Skin', value: skins.Booster}
      )
  );
}

async function react(interaction) {
  const skin_type = interaction.options.getString('skin_type');
  const target_user = interaction.options.getUser('user');
  skinForm.sendFormMessage(target_user, -1, skin_type);
  
  logs.logMessage(`❓ Asking \`${target_user}\` about their Minecraft UUID to add the ${skin_type} skin.`);
  await interaction.reply(logs.formatMessage(`💎 DM'ing \`${target_user}\` with a form for the ${skin_type} skin.`));
}

module.exports = { react, init };