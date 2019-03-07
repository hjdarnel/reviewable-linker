import { RTMClient, WebClient } from '@slack/client';
import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import * as caps from 'capitalize';

import parser from './parser';
import validateInput from './validateInput';
import { IGithubDTO, ISendSlackMessageDTO, IGithubMessage, ISlackReactionDTO } from './interface';

const logger = bunyan.createLogger({ name: 'reviewable-linker' });
const slackToken = process.env.SLACK_TOKEN || '';
const id = 1;
const type = 'message';

interface ISelf {
    id: string;
    name: string;
}
let self: ISelf;

if (!slackToken) {
    logger.error('missing environment variable SLACK_TOKEN');
    process.exit(1);
}

const rtm = new RTMClient(slackToken);
const web = new WebClient(slackToken);

const connect = () => {
    rtm.on('authenticated', rtmStartData => {
        self = rtmStartData.self;
        logger.info(`Logged in as ${self.name} of team ${rtmStartData.team.name}`);
    });

    rtm.start();

    rtm.on('reaction_added', async (body: ISlackReactionDTO) => {
        if (body.item_user === self.id && body.reaction === 'no_reviewable') {
            logger.info('Deleting a message', body);
            web.chat.delete({ channel: body.item.channel, ts: body.item.ts }).catch(logger.error);
        }
    });

    rtm.on('message', async message => {
        try {
            const response = await parser(message);
            const validatedMessage = await validateInput(response);

            if (!_.isEmpty(validatedMessage.pulls)) {
                if (message.thread_ts) {
                    logger.info('thread!', message);
                    await sendMessage(validatedMessage, message.channel, message.thread_ts);
                } else {
                    await sendMessage(validatedMessage, message.channel);
                }
            }
        } catch (e) {
            logger.warn('Error', e);
        }
    });
};

const emojifyInt = (value: number) => {
    if (value === 0) {
        return ':0-red:';
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

    if (value > 349) {
        return ':100k:';
    }

    return '';
};

const sendMessage = (message: IGithubMessage, channel: string, ts?: string) => {
    const urls = [];
    let text = '';

    for (const review of message.pulls) {
        review.state = caps(review.state);
        review.additionsEmoji = emojifyInt(review.additions);
        review.deletionsEmoji = emojifyInt(review.deletions);

        if (review.merged === true) {
            review.state = `:git-pull-merged: Merged`;
        } else if (review.state === 'Closed') {
            review.state = `:git-pull-closed: ${review.state}`;
        } else if (review.state === 'Open') {
            review.state = `:git-pull-open: hi mom ${review.state}`;
        }
        if (ts) {
            logger.info('Sending message in thread');
            urls.push(`"*${review.title}*"
in _${review.repository}_ - *${review.state}*
${review.commits} commit${review.commits > 1 ? 's' : ''} - ${review.additionsEmoji} +${
                review.additions
            } | -${review.deletions} ${review.deletionsEmoji}
https://reviewable.io/reviews/${review.organization}/${review.repository}/${review.pullNumber}`);
        } else {
            urls.push(`"*${review.title}*" in _${review.repository}_
*${review.state}* - ${review.commits} commit${review.commits > 1 ? 's' : ''} - ${
                review.additionsEmoji
            } +${review.additions} | -${review.deletions} ${review.deletionsEmoji}
https://reviewable.io/reviews/${review.organization}/${review.repository}/${review.pullNumber}`);
        }
    }

    for (const url of urls) {
        text = `${text}\n\n${url}`;
    }
    const response: ISendSlackMessageDTO = {
        id,
        type,
        channel,
        text
    };

    if (ts) {
        response.thread_ts = ts;
    }

    logger.info(`Sending message:`, text);
    rtm.addOutgoingEvent(true, 'message', response);
};

export default connect;
