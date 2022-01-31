// Discord setup
const { token } = require('./token.json');
const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

// Other setup
const https = require('https')
const cron = require('cron')

client.on("ready", () => {
  console.log("I am ready!");
  get_news.start();
});

// Every 15th and 45th minute "15,45 * * * *"
let get_news = new cron.CronJob('* * * * *', async () => {
  // This runs every hour at minute 15 and 45
  var my_guild = client.guilds.cache.get("757703450648641648");
  var my_channel = client.channels.cache.get("937523655074783273");

  https.get('https://cms.zaonce.net/en-GB/jsonapi/node/galnet_article?&sort=-published_at&page[offset]=0&page[limit]=1', (response) => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      var article = JSON.parse(data);
      console.log(article.data[0].attributes.published_at);
      var title = "__**" + article.data[0].attributes.title + "**__\n";
      var date = "_" + article.data[0].attributes.field_galnet_date + "_\n";
      var link = "https://community.elitedangerous.com/galnet/uid/" + article.data[0].attributes.field_galnet_guid + "\n";
      var body = ">>> " + article.data[0].attributes.body.value;
      body = body.replace(/(\*|_|`|~|\\)/g, '\\$1');
      my_channel.send(title.concat(date, link, body));
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

// When you want to start it, use:


// Listening to commands
client.on("messageCreate", (message) => {
  // If someone mentions the bot
  if (message.mentions.has(client.user.id)) {
    // Sets the channel to update
    if (message.content.includes("setchannel")) {
      message.channel.send("Will update channel with Galnet articles.");
    }
  }
});

client.login(token);
