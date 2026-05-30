require('dotenv').config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');

const app = express();

// ===== WEB SERVER (WAJIB BIAR RENDER TIDAK SLEEP) =====
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server aktif");
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ENV
const TOKEN = process.env.TOKEN;
const ROLE_IN = process.env.ROLE_IN;
const LOG_CHANNEL = process.env.LOG_CHANNEL;
const PANEL_CHANNEL = process.env.PANEL_CHANNEL;

// READY EVENT
client.once(Events.ClientReady, async () => {
  console.log(`Bot online sebagai ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(PANEL_CHANNEL);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_in')
        .setLabel('IN 🟢')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('btn_out')
        .setLabel('OUT 🔴')
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: "** IN / OUT KOTA**\nKlik tombol di bawah:",
      components: [row]
    });

  } catch (err) {
    console.log("Gagal kirim panel:", err);
  }
});

// BUTTON HANDLER
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const role = interaction.guild.roles.cache.get(ROLE_IN);
  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL);

  if (!role) return interaction.reply({ content: "Role tidak ditemukan!", ephemeral: true });

  if (interaction.customId === 'btn_in') {
    await member.roles.add(role);

    await interaction.reply({
      content: 'Kamu sudah IN 🟢',
      ephemeral: true
    });

    if (logChannel) {
      logChannel.send(`🟢 ${interaction.user.tag} klik IN`);
    }
  }

  if (interaction.customId === 'btn_out') {
    await member.roles.remove(role);

    await interaction.reply({
      content: 'Kamu sudah OUT 🔴',
      ephemeral: true
    });

    if (logChannel) {
      logChannel.send(`🔴 ${interaction.user.tag} klik OUT`);
    }
  }
});

// LOGIN BOT
client.login(TOKEN);