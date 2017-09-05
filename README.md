# Reviewable Linker

This is a simple Slack bot that will listen for GitHub PR links in whatever channel it's invited to, and respond with the corresponding Reviewable link.

## Setup

0. Create bot on Slack team (`https://TEAMNAME.slack.com/apps/manage/custom-integrations` -> Bots -> Add Configuration)

1. Clone repo

2. Set `SLACK_TOKEN` to bot token

3. Run `npm run start` to serve, or `npm run start:dev` for a reloading dev workspace

Must have environment variable `SLACK_TOKEN` set to a bot user token for your Slack team. This begins with `xoxb-...`