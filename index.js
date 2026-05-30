require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

const app = express();

// ===== WEB SERVER =====
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server aktif");
});

// ===== ENV =====
const TOKEN = process.env.TOKEN;
const ROLE_IN = process.env.ROLE_IN;
const LOG_CHANNEL = process.env.LOG_CHANNEL;
const PANEL_CHANNEL = process.env.PANEL_CHANNEL;

if (!TOKEN) {
  console.log("TOKEN tidak ada!");
  process.exit(1);
}

// ===== DISCORD CLIENT (FIX INTENT) =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// ===== READY =====
client.once(Events.ClientReady, async (bot) => {
  console.log(`Bot online sebagai ${bot.user.tag}`);

  try {
    const channel = await client.channels.fetch(PANEL_CHANNEL);

    if (!channel) {
      console.log("❌ Panel channel salah / tidak ditemukan");
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_in")
        .setLabel("IN 🟢")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("btn_out")
        .setLabel("OUT 🔴")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: "**IN / OUT KOTA**\nKlik tombol di bawah:",
      components: [row]
    });

    console.log("Panel berhasil dikirim");

  } catch (err) {
    console.log("ERROR kirim panel:", err);
  }
});

// ===== BUTTON HANDLER =====
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  console.log("BUTTON:", interaction.customId);

  try {
    const guild = interaction.guild;
    if (!guild) return;

    const member = interaction.member; // 🔥 FIX: tidak pakai fetch (lebih stabil)

    const role = guild.roles.cache.get(ROLE_IN);
    if (!role) {
      return interaction.reply({
        content: "❌ Role tidak ditemukan (cek ROLE_IN)",
        ephemeral: true
      });
    }

    const logChannel = guild.channels.cache.get(LOG_CHANNEL);

    if (interaction.customId === "btn_in") {
      await member.roles.add(role);

      await interaction.reply({
        content: "✅ Kamu sudah IN 🟢",
        ephemeral: true
      });

      if (logChannel) {
        logChannel.send(`🟢 ${interaction.user.tag} klik IN`);
      }
    }

    if (interaction.customId === "btn_out") {
      await member.roles.remove(role);

      await interaction.reply({
        content: "✅ Kamu sudah OUT 🔴",
        ephemeral: true
      });

      if (logChannel) {
        logChannel.send(`🔴 ${interaction.user.tag} klik OUT`);
      }
    }

  } catch (err) {
    console.log("ERROR BUTTON:", err);
  }
});

// ===== LOGIN =====
client.login(TOKEN);
