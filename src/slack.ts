import { RTMClient } from '@slack/client';
import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import * as caps from 'capitalize';

import parser from './parser';
import validateInput from './validateInput';
import { IGithubDTO, ISendSlackMessageDTO, IGithubMessage } from './interface';

const logger = bunyan.createLogger({ name: 'reviewable-linker' });
const slackToken = process.env.SLACK_TOKEN || '';
const id = 1;
const type = 'message';

if (!slackToken) {
    logger.error('missing environment variable SLACK_TOKEN');
    process.exit(1);
}

const rtm = new RTMClient(slackToken);

const connect = () => {
    rtm.on('authenticated', rtmStartData => {
        logger.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
    });

    rtm.start();

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

        if (review.state === 'Closed') {
            review.state = `:no_entry_sign: ${review.state}`;
        }
        if (review.state === 'Open') {
            review.state = `:white_check_mark: ${review.state}`;
        }
        if (ts) {
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
