// Discord setup
const { token } = require("./token.json");
const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// Other setup
const fs = require("fs");
const https = require("https");
const cron = require("cron");
const Database = require('better-sqlite3');

// Create/Connect DB
const db = new Database('galnet-discord-bot.db', { verbose: console.log });
db.prepare("CREATE TABLE IF NOT EXISTS servers('guild_id' varchar PRIMARY KEY, 'channel_id' varchar, 'language' varchar);").run();

// Variables
var latest_sync = Date.now()

client.on("ready", () => {
  console.log("I am ready!");
  get_news.start();
});

// Every 15th and 45th minute "15,45 * * * *"
let get_news = new cron.CronJob("15,45 * * * *", async () => {
  https.get("https://cms.zaonce.net/en-GB/jsonapi/node/galnet_article?&sort=-published_at&page[offset]=0&page[limit]=1", (response) => {
    let data = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      data += chunk;
    });
    response.on("end", () => {
      var article = JSON.parse(data);
      console.log("Latest Sync:      " + latest_sync);
      console.log("Latest Published: " + Date.parse(article.data[0].attributes.published_at))
      if (Date.parse(article.data[0].attributes.published_at) >= latest_sync) {
        var title = "__**" + article.data[0].attributes.title + "**__\n";
        var date = "_" + article.data[0].attributes.field_galnet_date + "_\n";
        var link = "https://community.elitedangerous.com/galnet/uid/" + article.data[0].attributes.field_galnet_guid + "\n";
        var body = ">>> " + article.data[0].attributes.body.value;
        body = body.replace(/(\*|_|`|~|\\)/g, '\\$1');
        var message = title.concat(date, link, body);
        post(message)
      }
      latest_sync = Date.now()
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

// Post to servers
function post(content) {
  console.log("Updating all servers with new article.")
  console.log("New article to post: " + content);
  var servers = db.prepare("SELECT * FROM servers;").all();
  servers.forEach((server) => {
    let channel = client.channels.cache.get(server.channel_id);
    // If Channel exists, post
    if (channel) {
      channel.send(content);
      console.log("Posting to channel: " + server.channel_id)
    }
    else {
      console.log("Failed getting channel: " + server.channel_id);
    }
  });
};

// Listening to commands
client.on("messageCreate", (message) => {
  // If someone mentions the bot
  if (message.mentions.has(client.user.id)) {
    // Sets the channel to update
    if (message.content.includes("setchannel")) {
      message.channel.send("Will update this channel with Galnet articles.");
      db.prepare("INSERT OR REPLACE INTO servers (guild_id, channel_id, language) VALUES (?, ?, 'en-GB');").run(message.guild.id, message.channel.id);
    }
    if (message.content.includes("stop")) {
      message.channel.send("Removed from list to update.");
      console.log("Removing guild from servers list: " + message.guild.id);
      db.prepare("DELETE FROM servers WHERE guild_id = ?;").run(message.guild.id);
    }
  }
});

client.login(token);
