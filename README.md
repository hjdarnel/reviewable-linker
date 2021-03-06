# Reviewable Linker [![CircleCI](https://circleci.com/gh/hjdarnel/reviewable-linker.svg?style=svg)](https://circleci.com/gh/hjdarnel/reviewable-linker)

This is a simple Slack bot that will listen for GitHub PR links in whatever channel it's invited to, and respond with the corresponding Reviewable link.

## Setup

0. Create bot on Slack team (`https://TEAMNAME.slack.com/apps/manage/custom-integrations` -> Bots -> Add Configuration)

1. Clone repo

2. Set `SLACK_TOKEN` to bot token

3. Run `npm run start` to serve, or `npm run start:dev` for a reloading dev workspace

Must have environment variable `SLACK_TOKEN` set to a bot user token for your Slack team. This begins with `xoxb-...`

Finally, invite bot to a channel you'd like it to participate in. It will listen and respond in the same channel.

## Deploying

The master branch is deployed to my personal droplet, so only code intended for production should ever be in master.

See [CircleCI](https://circleci.com/gh/hjdarnel/reviewable-linker) for build status.
