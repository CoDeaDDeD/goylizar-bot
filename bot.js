const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ── Canciones de Big Vos$ ────────────────────────────────────────────────────
const songs = [
  { title: "PRFT MARTI", url: "https://soundcloud.com/big-vos-67676767/prft-marti-1" },
  { title: "The Vida of Raulito Bandito", url: "https://soundcloud.com/big-vos-67676767/the-vida-of-raulito-bandito-2" },
  { title: "Jazz Sobre un Skeit", url: "https://soundcloud.com/big-vos-67676767/jazz-sobre-un-skeit" },
  { title: "Casita Frente al Mar", url: "https://soundcloud.com/big-vos-67676767/casita-frente-al-mar" },
  { title: "898-989", url: "https://soundcloud.com/big-vos-67676767/898-989x-1" },
  { title: "The live of big vos dolar", url: "https://soundcloud.com/big-vos-67676767/the-live-of-big-vos-dolar-2" },
  { title: "NEW RAP GAME+", url: "https://soundcloud.com/big-vos-67676767/new-rap-game" },
];

// ── Frases hug/roast ─────────────────────────────────────────────────────────
const hugMessages = [
  "🌸 {target}, ты просто космос! Таких людей мало на этом свете.",
  "🤗 {target} получает огромный виртуальный обнимашек от {author}!",
  "💛 {target}, ты делаешь этот сервер теплее просто своим присутствием.",
  "🫂 {author} крепко обнимает {target}. Всё будет хорошо!",
  "✨ {target}, ты — луч света в тёмном царстве дискорда.",
  "💖 Напоминаем {target}: ты топчик и мы тебя любим.",
];
const roastMessages = [
  "🔥 {target}, ты единственный человек, которому Google выдаёт ошибку «слишком тупой запрос».",
  "💀 {target} играет в Minecraft на сложности «мирный» и всё равно умирает.",
  "🗑️ {target}, ты баг, который разработчик оставил в продакшне случайно.",
  "🧂 {target} думает, что CTRL+Z в реальной жизни работает.",
  "🐌 {target}, ты медленнее чем загрузка дискорда на 3G.",
  "🤡 {target} думает, что «пинг 200» — это нормально для жизни.",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function format(t, a, b) {
  return t.replace(/{author}/g, `**${a}**`).replace(/{target}/g, `**${b}**`);
}

// ── Función Gemini ────────────────────────────────────────────────────────────
async function askGemini(systemPrompt, userQuestion) {
  const prompt = `${systemPrompt}\n\nPregunta: ${userQuestion}\n\nResponde de forma breve y clara, máximo 3-4 líneas. Sin markdown excesivo.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Prompts por tema ─────────────────────────────────────────────────────────
const PROMPTS = {
  mlp: `Eres un experto en My Little Pony: Friendship is Magic (MLP). 
Conoces todos los personajes (Twilight Sparkle, Rainbow Dash, Pinkie Pie, Rarity, Applejack, Fluttershy, etc.), 
episodios, lore, razas de ponies (unicornio, pegaso, tierra), lugares como Ponyville y Canterlot, 
y la historia de Equestria. Responde preguntas sobre MLP de forma entusiasta y amigable.`,

  math: `Eres un profesor de matemáticas que explica conceptos básicos de forma simple y clara.
Puedes resolver sumas, restas, multiplicaciones, divisiones, fracciones, porcentajes, 
álgebra básica, geometría básica y explicar conceptos matemáticos elementales.
Muestra siempre el procedimiento paso a paso de forma muy breve.`,

  jewish: `Eres un experto en cultura, historia y tradiciones judías.
Puedes responder preguntas sobre: festividades (Shabat, Janucá, Pésaj, Rosh Hashaná, Yom Kipur),
historia del pueblo judío, Torah y textos sagrados, tradiciones y costumbres, 
conceptos como kosher, bar mitzvá, sinagoga, etc. Responde con respeto y precisión.`,
};

// ── Slash commands ───────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder().setName("avatar").setDescription("Avatar de un usuario en tamaño completo")
    .addUserOption(o => o.setName("user").setDescription("Usuario").setRequired(true)),
  new SlashCommandBuilder().setName("hug").setDescription("Mandar un cumplido 💛")
    .addUserOption(o => o.setName("user").setDescription("¿A quién?").setRequired(true)),
  new SlashCommandBuilder().setName("roast").setDescription("Roastear a alguien 🔥")
    .addUserOption(o => o.setName("user").setDescription("¿A quién?").setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    console.log("⏳ Registrando slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Comandos registrados!");
  } catch (err) { console.error("❌", err); }
})();

// ── Cliente ──────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => console.log(`🤖 Bot online: ${client.user.tag}`));

// ── Sistema NEKO ─────────────────────────────────────────────────────────────
//
//  MÚSICA:
//    neko rap / neko kiss / neko song / neko beat / neko play / neko música
//
//  IA con Gemini:
//    neko mlp <pregunta>       → datos de My Little Pony
//    neko math <pregunta>      → matemáticas básicas
//    neko jewish <pregunta>    → preguntas sobre judaísmo
//
const musicTriggers = new Set(["rap", "kiss", "song", "música", "musica", "beat", "track", "play", "vos", ""]);
const aiTriggers = { mlp: "mlp", math: "math", jewish: "jewish" };

const aiColors = { mlp: 0xff69b4, math: 0x4fc3f7, jewish: 0xffd700 };
const aiEmojis = { mlp: "🦄", math: "🧮", jewish: "✡️" };
const aiTitles = { mlp: "My Little Pony", math: "Matemáticas", jewish: "Cultura Judía" };

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();
  const lower = content.toLowerCase();

  if (!lower.startsWith("neko")) return;

  const afterNeko = content.slice(4).trim();
  const afterNekoLower = afterNeko.toLowerCase();

  // ── Detectar trigger de IA ────────────────────────────────────────────────
  let detectedAI = null;
  let userQuestion = "";

  for (const [key] of Object.entries(aiTriggers)) {
    if (afterNekoLower.startsWith(key)) {
      detectedAI = key;
      userQuestion = afterNeko.slice(key.length).trim();
      break;
    }
  }

  if (detectedAI) {
    if (!userQuestion) {
      return message.reply(`${aiEmojis[detectedAI]} Escribe tu pregunta después de \`neko ${detectedAI}\`. Ejemplo: \`neko ${detectedAI} ¿quién es Twilight Sparkle?\``);
    }

    // Indicador de "escribiendo..."
    await message.channel.sendTyping();

    try {
      const answer = await askGemini(PROMPTS[detectedAI], userQuestion);

      const embed = new EmbedBuilder()
        .setTitle(`${aiEmojis[detectedAI]} ${aiTitles[detectedAI]}`)
        .setDescription(`**Pregunta:** ${userQuestion}\n\n${answer}`)
        .setColor(aiColors[detectedAI])
        .setFooter({ text: "Powered by Google Gemini ✨" });

      await message.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Gemini error:", err);
      await message.reply("❌ Error al conectar con Gemini. Intenta de nuevo en un momento.");
    }
    return;
  }

  // ── Trigger de música ─────────────────────────────────────────────────────
  if (musicTriggers.has(afterNekoLower)) {
    const song = pick(songs);
    const embed = new EmbedBuilder()
      .setTitle("🎵 Big Vos$ — canción aleatoria")
      .setDescription(`**[${song.title}](${song.url})**\n\nDale click para escuchar en SoundCloud 🔊`)
      .setColor(0xff5500)
      .setThumbnail("https://i1.sndcdn.com/avatars-1qwjCegKQAeXSIHx-MfZQ3w-t500x500.jpg")
      .setFooter({ text: "SoundCloud · Big Vos$" })
      .setURL(song.url);

    await message.reply({ embeds: [embed] });
  }
});

// ── Slash handler ─────────────────────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  const target = interaction.options.getUser("user");
  const author = interaction.user;

  if (commandName === "avatar") {
    const member = interaction.guild?.members.cache.get(target.id);
    const url = member?.displayAvatarURL({ size: 4096, extension: "png" }) ?? target.displayAvatarURL({ size: 4096, extension: "png" });
    await interaction.reply({ embeds: [new EmbedBuilder().setTitle(`🖼️ Avatar de ${target.displayName ?? target.username}`).setImage(url).setColor(0x5865f2).setURL(url).setFooter({ text: "Haz clic en el título para abrir en tamaño completo" })] });
  }

  if (commandName === "hug") {
    if (target.id === author.id) return interaction.reply({ content: "🥲 Abrazarte a ti mismo... te entiendo.", ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setDescription(format(pick(hugMessages), author.displayName ?? author.username, target.displayName ?? target.username)).setColor(0xffa8c5).setThumbnail(target.displayAvatarURL({ size: 256 }))] });
  }

  if (commandName === "roast") {
    if (target.id === client.user.id) return interaction.reply({ content: "😎 Yo no me roasteo. Tengo dignidad.", ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder().setDescription(format(pick(roastMessages), author.displayName ?? author.username, target.displayName ?? target.username)).setColor(0xff4444).setThumbnail(target.displayAvatarURL({ size: 256 }))] });
  }
});

client.login(TOKEN);
