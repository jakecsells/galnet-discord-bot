// Discord setup
const { token } = require("./token.json");
const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// Other setup
const fs = require("fs")
const https = require("https")
const cron = require("cron")

// Variables
var latest_sync = Date.now()

client.on("ready", () => {
  console.log("I am ready!");
  get_news.start();
});

// Every 15th and 45th minute "15,45 * * * *"
let get_news = new cron.CronJob("* * * * *", async () => {
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
        console.log("Updating all servers with new article.")
        var title = "__**" + article.data[0].attributes.title + "**__\n";
        var date = "_" + article.data[0].attributes.field_galnet_date + "_\n";
        var link = "https://community.elitedangerous.com/galnet/uid/" + article.data[0].attributes.field_galnet_guid + "\n";
        var body = ">>> " + article.data[0].attributes.body.value;
        body = body.replace(/(\*|_|`|~|\\)/g, '\\$1');
        var message = title.concat(date, link, body);
        // Read the server list and send out article
        fs.readFile('./servers.json', 'utf8', (err, data) => {
          if (err) {
            console.log(`Error reading file from disk: ${err}`);
          } else {
            // parse JSON string to JSON object
            const servers = JSON.parse(data);
            servers.forEach((server) => {
              console.log("Updating channel: " + server.channel_id)
              let channel = client.channels.cache.get(server.channel_id);
              channel.send(message);
            });
          }
        });
      }
      latest_sync = Date.now()
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});


// Listening to commands
client.on("messageCreate", (message) => {
  // If someone mentions the bot
  if (message.mentions.has(client.user.id)) {
    // Sets the channel to update
    if (message.content.includes("setchannel")) {
      message.channel.send("Will update channel with Galnet articles.");
      fs.readFile('./servers.json', 'utf8', (err, data) => {
        if (err) {
          console.log(`Error reading file from disk: ${err}`);
        } else {
          // parse JSON string to JSON object
          const servers = JSON.parse(data);

          // add a new record
          servers.push({
            guild_id: message.guild.id,
            channel_id: message.channel.id
          });
          // write new data back to the file
          fs.writeFile('./servers.json', JSON.stringify(servers, null, 4), (err) => {
            if (err) {
              console.log(`Error writing file: ${err}`);
            }
          });
        }
      });
    }
  }
});

client.login(token);
