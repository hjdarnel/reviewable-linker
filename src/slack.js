const bunyan = require('bunyan');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const _ = require('lodash');
const caps = require('capitalize');

const parser = require('./parser.js');
const validateInput = require('./validateInput.js');

const logger = bunyan.createLogger({name: 'reviewable-linker'});
const slackToken = process.env.SLACK_TOKEN || '';

const id = 1;
const type = 'message';

if (!slackToken) {
    logger.error('missing environment variable SLACK_TOKEN');
    process.exit(1);
}

const rtm = new RtmClient(slackToken);

const connect = () => {
    // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
        logger.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
    });

    // you need to wait for the client to fully connect before you can send messages
    rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
        logger.info('Connection opened');
    });

    rtm.start();

    rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
        parser(message).then((response) => {
            const results = validateInput(response);

            if (!_.isEmpty(results)) {
                results.unshift(message.channel);
                sendMessage(results);
            }
        });
      });
};

const emojifyInt = (value, isAddition) => { //eslint-disable-line no-unused-vars

    if (value === 0) {
        return ':0:';
    }

    if (value > 0 && value < 30) {
        return ':10:';
    }

    if (value > 20 && value < 100) {
        return ':100:';
    }

    if (value > 99 && value < 200) {
        return ':1000:';
    }

    if (value > 199 && value < 350) {
        return ':10k:';
    }

    if (value > 349 ) {
        return ':100k:';
    }

    return '';
};

const sendMessage = (reviews) => {
    const urls = [];
    const channel = reviews[0];
    let text = '';
    reviews.shift();

    for (const review of reviews) {
        review.state = caps(review.state);
        review.additionsEmoji = emojifyInt(review.additions, true);
        review.deletionsEmoji = emojifyInt(review.deletions, false);

        if (review.state === 'Closed') {
            review.state = `:no_entry_sign:${review.state}`;
        }
        if (review.state === 'Open') {
            review.state = `:white_check_mark:${review.state}`;
        }

        urls.push(`"*${review.title}*" in _${review.repository}_
*${review.state}* - ${review.commits} commits - ${review.additionsEmoji} +${review.additions} | -${review.deletions} ${review.deletionsEmoji}
https://reviewable.io/reviews/${review.team}/${review.repository}/${review.pullNumber}`);
    }

    for (const url of urls) {
        text = `${text}\n${url}`;
    }
    const message = {
        id,
        type,
        channel,
        text
    };

    const channelName = rtm.dataStore.getChannelGroupOrDMById(channel);
    logger.info(`Sending message in ${channelName.name}:`, text);
    rtm.send(message);
};

module.exports = connect;
