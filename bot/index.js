require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

const app = require('../api/server'); // API junto

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

mongoose.connect(process.env.MONGO_URI);

const User = require('../models/User');
const Saque = require('../models/Saque');

client.once('ready', () => {
  console.log('Bot ON');
});

// pontos
client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.length > 5) {
    await User.findOneAndUpdate(
      { userId: msg.author.id },
      { $inc: { pontos: 1 } },
      { upsert: true }
    );
  }
});

// interação
client.on('interactionCreate', async (interaction) => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'loja') {

      const embed = new EmbedBuilder()
        .setTitle('🛒 System Store')
        .setDescription('💰 Troque pontos por recompensas')
        .addFields(
          { name: '💸 PIX', value: '100 pts', inline: true },
          { name: '🎮 Item', value: '200 pts', inline: true }
        )
        .setColor(0x00ff99);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pix').setLabel('PIX').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('item').setLabel('Item').setStyle(ButtonStyle.Primary)
      );

      interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.pontos < 100)
      return interaction.reply({ content: 'Sem pontos', ephemeral: true });

    user.pontos -= 100;
    await user.save();

    await Saque.create({
      userId: user.userId,
      valor: 5,
      premio: 'PIX'
    });

    interaction.reply({ content: 'Saque criado!', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
