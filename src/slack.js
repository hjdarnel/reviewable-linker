const bunyan = require('bunyan');
const RtmClient = require('@slack/client').RtmClient;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const _ = require('lodash');

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
        let results = parser(message);
        results = validateInput(results);
        if (!_.isEmpty(results)) {
            results.unshift(message.channel);
            sendMessage(results);
        }
      });
};

const sendMessage = (reviews) => {
    const urls = [];
    const channel = reviews[0];
    let text = '';
    reviews.shift();

    _.map(reviews, (review) => {
        urls.push(`https://reviewable.io/reviews/casestack/${review.repository}/${review.pullNumber}`);
    });

    for (const url of urls) {
        text = `${text}\n${url}`;
    }
    const message = {
        id,
        type,
        channel,
        text
    };
    logger.info(`Sending message in ${channel}:`, text);
    rtm.send(message);
};

module.exports = connect;
