require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

// iniciar API (painel)
require('../api/server');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🧠 conectar Mongo com log
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Mongo conectado'))
    .catch(err => console.error('Erro Mongo:', err));
} else {
  console.log('Sem MONGO_URI');
}

// models
const User = require('../models/User');
const Saque = require('../models/Saque');

// bot online
client.on('ready', () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

// erro do bot
client.on('error', console.error);

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
          { name: '💸 PIX R$5', value: '100 pontos', inline: true },
          { name: '🎮 Item Raro', value: '200 pontos', inline: true }
        )
        .setColor(0x00ff99);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('pix')
          .setLabel('💸 PIX')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('item')
          .setLabel('🎮 Item')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  }

  if (interaction.isButton()) {

    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.pontos < 100) {
      return interaction.reply({ content: '❌ Pontos insuficientes', ephemeral: true });
    }

    user.pontos -= 100;
    await user.save();

    await Saque.create({
      userId: user.userId,
      valor: 5,
      premio: 'PIX'
    });

    interaction.reply({
      content: '✅ Saque criado com sucesso!',
      ephemeral: true
    });
  }
});

// 🚀 LOGIN COM VERIFICAÇÃO
if (!process.env.TOKEN) {
  console.error('❌ TOKEN não definido!');
} else {
  client.login(process.env.TOKEN)
    .then(() => console.log('Conectando ao Discord...'))
    .catch(err => console.error('Erro ao logar:', err));
}
