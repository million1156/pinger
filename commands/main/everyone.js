const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
module.exports = {
  // Slash command data
  data: new SlashCommandBuilder()
    .setName("sendping")
    .setDescription("Sends an active ping or @everyone in the channel")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of ping to send")
        .setRequired(true)
        .addChoices(
          { name: "Active Ping", value: "active_ping" },
          { name: "@everyone", value: "everyone" }
        )
    ),

  async execute(interaction) {
    let type = interaction.options.getString("type");
    let message = interaction.options.getString("message");

    /* @EVERYONE PING */
    if (type === "everyone") {
      // make sure user is admin
      if (
        !interaction.member.roles.cache.some(
          (role) => role.name === "head admin"
        )
      ) {
        let errorEmbed = new EmbedBuilder()
          .setTitle(`Error!`)
          .setDescription(
            `${config.errorEmoji} You must be an administrator to @everyone :)`
          )
          .setColor("Red")
          .setFooter({ text: config.embed.footer })
          .setTimestamp();
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      // make sure not to leak bot token
      if (message.includes(config.token)) {
        let errorEmbed = new EmbedBuilder()
          .setTitle(`Error!`)
          .setDescription(
            `${config.errorEmoji} You cannot send a message with the bot token!`
          )
          .setColor("Red")
          .setFooter({ text: config.embed.footer })
          .setTimestamp();
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }
      // log message to channelid using an embed
      let logEmbed = new EmbedBuilder()
        .setTitle(`@everyone ping sent!`)
        .setDescription(
          `**Message:** ${message}\n**Sent by:** ${interaction.user.tag}`
        )
        .setColor("Green")
        .setFooter({ text: config.embed.footer })
        .setTimestamp();
        const channelId = config.logChannel;
        const channel = interaction.client.channels.cache.get(channelId);
        if (!channel) {
            console.warn('Channel not found');
            return;
        }

        // send embed to channel
        channel.send({ embeds: [logEmbed] });
      interaction.channel.send(`@everyone ${message}`);
    } else {
    /* ACTIVE PING  */
      // make sure user is staff
      if (
        !interaction.member.roles.cache.some((role) => role.name === "staff")
      ) {
        let errorEmbed = new EmbedBuilder()
          .setTitle(`Error!`)
          .setDescription(
            `${config.errorEmoji} You must be staff to send an active ping!`
          )
          .setColor("Red")
          .setFooter({ text: config.embed.footer })
          .setTimestamp();
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      // make sure not to leak bot token
      if (message.includes(config.token)) {
        let errorEmbed = new EmbedBuilder()
          .setTitle(`Error!`)
          .setDescription(
            `${config.errorEmoji} You cannot send a message with the bot token!`
          )
          .setColor("Red")
          .setFooter({ text: config.embed.footer })
          .setTimestamp();
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      // log message to channelid using an embed
      let logEmbed = new EmbedBuilder()
        .setTitle(`Active Ping Sent!`)
        .setDescription(
          `**Message:** ${message}\n**Sent by:** ${interaction.user.tag}`
        )
        .setColor("Green")
        .setFooter({ text: config.embed.footer })
        .setTimestamp();
        const channelId = config.logChannel;
        const channel = interaction.client.channels.cache.get(channelId);
        if (!channel) {
            console.warn('Channel not found');
            return;
        }

        // send embed to channel
        channel.send({ embeds: [logEmbed] });

      interaction.channel.send(`<@&${config.activePing}> ${message}`);
    }
    let successEmbed = new EmbedBuilder()
      .setTitle(`Success!`)
      .setDescription(`${config.successEmoji} Successfully sent message!`)
      .setColor("Green")
      .setFooter({ text: config.embed.footer })
      .setTimestamp();
    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
    return;
  },
};
