# Galnet Discord Bot
Discord bot to post Galnet News from Elite: Dangerous. This bot will check Galnet twice an hour for a new article and post to any subscribed Discord servers.

![Example Image of Bot](/example_image.jpg?raw=true)

## Add the Bot to your Server

1. [Invite the Bot to your Server](https://discord.com/oauth2/authorize?client_id=937466947975651378&permissions=445440&scope=bot)
2. Give the bot the necessary permissions to post
3. Mention the bot in the channel you want it to post to: `@Galnet News setchannel`

## Stop Receiving Posts

1. Mention the bot with the stop command: `@Galnet News stop`

# Host Your Own Bot
The bot is running on nodejs and discordjs. You can host this on any computer and it's very lightweight.

## Requirements
* discord.js
* better-sqlite3
* cron
* https

## Setup

1. Pull the repo `git clone https://github.com/jakecsells/galnet-discord-bot.git`
2. In the repo directory, run `npm update`
3. Get your discord bot token https://discordapp.com/developers/applications/
4. Create a file called `token.json` with your token in the repo directory:
```
{
  "token": "<Your Token>"
}
```
5. In the repo directory, run `npm start`
