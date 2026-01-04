const fs = require("fs");
const readline = require("readline");
const path = require("path");
function patchClientUserSettingManager() {
  try {
    const managerPath = path.join(
      __dirname,
      "node_modules",
      "discord.js-selfbot-v13",
      "src",
      "managers",
      "ClientUserSettingManager.js"
    );
    const normalizedPath = path.resolve(managerPath).replace(/\\/g, "/");
    let ClientUserSettingManager = null;
    for (const key in require.cache) {
      const cacheKey = key.replace(/\\/g, "/");
      if (
        cacheKey === normalizedPath ||
        cacheKey.endsWith("ClientUserSettingManager.js")
      ) {
        ClientUserSettingManager = require.cache[key].exports;
        break;
      }
    }
    if (!ClientUserSettingManager) {
      for (const key in require.cache) {
        if (key.includes("ClientUserSettingManager")) {
          delete require.cache[key];
        }
      }
      ClientUserSettingManager = require(managerPath);
    }
    if (
      ClientUserSettingManager &&
      ClientUserSettingManager.prototype &&
      ClientUserSettingManager.prototype._patch
    ) {
      if (ClientUserSettingManager.prototype._patch.__patched) {
        return true;
      }

      const originalPatch = ClientUserSettingManager.prototype._patch;
      ClientUserSettingManager.prototype._patch = function (data) {
        if (data && "friend_source_flags" in data) {
          if (
            data.friend_source_flags === null ||
            data.friend_source_flags === undefined
          ) {
            data.friend_source_flags = { all: false };
          }
        }
        return originalPatch.call(this, data);
      };
      ClientUserSettingManager.prototype._patch.__patched = true;
      return true;
    }
  } catch (error) {}
  return false;
}
patchClientUserSettingManager();

const { Client } = require("discord.js-selfbot-v13");
process.nextTick(() => {
  patchClientUserSettingManager();
});
function readTokens() {
  try {
    const data = fs.readFileSync("zyp.txt", "utf-8");
    const tokens = data
      .split(/\r?\n/)
      .map((token) => {
        return token
          .replace(/[\u200B-\u200D\uFEFF]/g, "")
          .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, "")
          .trim();
      })
      .filter((token) => token.length > 0);
    return tokens.map((token) => {
      return token.replace(/[^\w.\-]/g, "");
    });
  } catch (error) {
    console.error("zyp.txt dosyası okunamadı:", error.message);
    process.exit(1);
  }
}
function parseMessageUrl(url) {
  const regex = /discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error("Geçersiz mesaj URL formatı!");
  }

  return {
    guildId: match[1],
    channelId: match[2],
    messageId: match[3],
  };
}
function getMessageUrl() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Mesaj bağlantısını girin: ", (url) => {
      rl.close();
      resolve(url.trim());
    });
  });
}
async function addReaction(client, guildId, channelId, messageId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    const message = await channel.messages.fetch(messageId);
    const reactions = message.reactions.cache;

    if (reactions.size === 0) {
      console.log(`[${client.user.tag}] Mesajda reaction yok, atlanıyor`);
      return;
    }
    let selectedReaction;
    if (reactions.size > 1) {
      const reactionArray = Array.from(reactions.values());
      selectedReaction =
        reactionArray[Math.floor(Math.random() * reactionArray.length)];
    } else {
      selectedReaction = reactions.first();
    }
    await message.react(selectedReaction.emoji);
    const emojiName =
      selectedReaction.emoji.name || selectedReaction.emoji.identifier;
    console.log(`[${client.user.tag}] ✓ Reaction eklendi: ${emojiName}`);
  } catch (error) {
    console.error(
      `[${client.user?.tag || "Bilinmeyen"}] ✗ Hata:`,
      error.message
    );
  }
}
async function main() {
  console.log("Discord Reaction Bot Başlatılıyor...\n");
  const tokens = readTokens();
  console.log(`${tokens.length} adet token bulundu\n`);

  if (tokens.length === 0) {
    console.error("Hiç token bulunamadı! zyp.txt dosyasını kontrol edin.");
    process.exit(1);
  }
  const messageUrl = await getMessageUrl();
  let messageData;

  try {
    messageData = parseMessageUrl(messageUrl);
  } catch (error) {
    console.error("Hata:", error.message);
    process.exit(1);
  }
  const clients = [];

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    token = token.trim().replace(/[^\w.\-]/g, "");
    patchClientUserSettingManager();

    const client = new Client({
      checkUpdate: false,
    });

    client.once("ready", async () => {
      console.log(
        `[${i + 1}/${tokens.length}] ${client.user.tag} - Giriş yapıldı`
      );
      await addReaction(
        client,
        messageData.guildId,
        messageData.channelId,
        messageData.messageId
      );
      setTimeout(() => {
        client.destroy();
      }, 2000);
    });

    client.on("error", (error) => {
      console.error(`[Token ${i + 1}] ✗ Hata:`, error.message);
    });
    try {
      await client.login(token).catch((loginError) => {
        if (loginError.message.includes("invalid token")) {
          console.error(`[Token ${i + 1}] ✗ Geçersiz token`);
        } else {
          console.error(`[Token ${i + 1}] ✗ Giriş hatası:`, loginError.message);
        }
        throw loginError;
      });
      clients.push(client);
    } catch (error) {
      try {
        client.destroy();
      } catch (e) {}
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  setTimeout(() => {
    console.log("\nTüm işlemler tamamlandı!");
    process.exit(0);
  }, tokens.length * 3000 + 5000);
}
main().catch(console.error);
