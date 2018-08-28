import _ = require('lodash');
import bunyan = require('bunyan');
import { getPull } from './github';
import { IParsedUrl, ISlackMessageDTO, IGithubMessage } from './interface';

const logger = bunyan.createLogger({ name: 'reviewable-linker' });

const parser = async (message: ISlackMessageDTO): Promise<IGithubMessage> => {
    const pulls: IParsedUrl[] = [];
    const results = {
        pulls
    };
    const promises = [];

    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/([a-z, A-Z, 0-9, -]*)\/([a-z, A-Z, 0-9, -]*)\/pull\/(\d*)(?:\?bot=([a-z]*))*/gm;
    let data = pullRegex.exec(message.text);

    while (data != null) {
        const pull = {
            organization: data[1],
            repository: data[2],
            pullNumber: parseInt(data[3], 10),
            shareLink: data[4]
        };

        if (pull.shareLink) {
            pull.shareLink = pull.shareLink.toLowerCase();
        }

        if (_.get(pull, 'shareLink') === 'n' || _.get(pull, 'shareLink') === 'no') {
            logger.info('Skipped link', pull);
        } else if (!pull.organization || !pull.repository || !pull.pullNumber) {
            logger.warn('Empty field! Skipping', pull);
        } else {
            results.pulls.push(pull);
        }
        data = pullRegex.exec(message.text);
    }

    for (const pull of results.pulls) {
        const promiseGithub = getPull(pull)
            .then(data => {
                return {
                    ...pull,
                    title: data.title,
                    state: data.state,
                    commits: data.commits,
                    additions: data.additions,
                    deletions: data.deletions
                };
            })
            .catch(err => {
                throw err;
            });

        promises.push(promiseGithub);
    }
    const fromGithub = await Promise.all(promises).catch(err => {
        throw err;
    });

    return {
        pulls: fromGithub,
        channel: message.channel,
        type: 'message',
        user: message.user,
        ts: message.ts
    };
};

export default parser;
