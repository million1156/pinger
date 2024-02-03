const fs = require("node:fs");
const chalk = require("chalk");
const path = require("node:path");
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ActivityType,
  EmbedBuilder,
  REST,
  Routes
} = require("discord.js");
const {
  clientId,
  guildId,
  token,
  config,
  defaultActivity,
  activityType,
  embed,
  errorEmoji,
} = require("./config.json");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Construct and prepare an instance of the REST module
let restToken;
let cliId;
if (!devEnv) {
  restToken = token;
  cliId = clientId;
} else {
  restToken = dev_token;
  cliId = devClientId;
}
const rest = new REST().setToken(restToken);

// Deploy commands
(async () => {
  try {
    console.log(
      chalk.green`[BOT] ` +
        chalk.white`Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(cliId, guildId),
      { body: commands }
    );

    console.log(
      chalk.green`[BOT] ` +
        chalk.white`Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // Log any errors
    console.error(error);
  }
})();

/* 
activity types
 1 - Watching
 2 - Listening
 3 - Playing
 4 - Streaming (too lazy to add proper support... why should i care)
*/
let typeActivity;
// sad
function checkActivityType() {
  if (activityType == 1) {
    typeActivity = ActivityType.Watching;
  } else if (activityType == 2) {
    typeActivity = ActivityType.Listening;
  } else if (activityType == 3) {
    typeActivity = ActivityType.Playing;
  } else if (activityType == 4) {
    typeActivity = ActivityType.Streaming;
  } else {
  }
}

//

// call check as function. why? because.... uh....... idk..... why did i do this?
checkActivityType();

// Set status
client.once(Events.ClientReady, () => {
  client.user.setPresence({
    activities: [
      { name: defaultActivity, type: typeActivity || ActivityType.Watching }
    ],
    status: "idle"
  });
  console.log(chalk.green`[BOT] ` + chalk.white`Ready!`);
});

// Command handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  // :/
  if (!command) return;

  // Add additional logging
  try {
        // Alternative to setDefaultMemberPermissions, as we should rely as little on Discord permissions as possible
        if (!interaction.member.roles.cache.some((role) => role.name === "staff")) {
          // Reply to the user
          let errorEmbed = new EmbedBuilder()
            .setTitle(`Error!`)
            .setDescription(
              // we cannot use errorEmoji, weird issue :/
              `<:error:1184551690351947846> You don't have permission to run this command!`
            )
            .setColor("Red")
            .setFooter({ text: embed.footer })
            .setTimestamp();
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          return;
        } 
    await command.execute(interaction);
    console.log(
      chalk.magenta`[COMMANDS] ` +
        chalk.white`Executed command: ${interaction.commandName}!`
    );
  } catch (error) {
    console.error(error);

    // A common error I tend to make is forgetting to return after replying to the user; therefore this allows for the bot to gracefully
    // display the error, this way I'm able to see and fix it (when it's deployed in DigitalOcean for example)
    if (interaction.replied || interaction.deferred) {
      console.log(
        chalk.red`[COMMANDS] ` +
          chalk.white`ERROR: Interaction already sent or deferred (maybe a return is missing?)`
      );
      // Reply to the user
      let errorEmbed = new EmbedBuilder()
        .setTitle(`Error!`)
        .setDescription(
          `${errorEmoji} There was an error while running this command! Please screenshot the following & report the issue.`
        )
        .addFields({ name: `Error: `, value: `${error}`, inline: false })
        .setColor("Red")
        .setFooter({ text: embed.footer })
        .setTimestamp();
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }
  }
});

// In a dev env, login using dev token
if (devEnv) {
  client.login(dev_token);
  return;
} else {
  client.login(token);
  return;
}
