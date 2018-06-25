const _ = require('lodash');
const bunyan = require('bunyan');
const Q = require('q');
const getPull = require('./github.js');
const logger = bunyan.createLogger({name: 'reviewable-linker'});

const parser = (message) => {
    const deferred = Q.defer();
    const results = {
        pulls: []
    };
    const promises = [];

    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/([a-z, A-Z, 0-9, -]*)\/([a-z, A-Z, 0-9, -]*)\/pull\/(\d*)(?:\?bot=([a-z]*))*/gm;
    let data = pullRegex.exec(message.text);

    while (data != null) {
        const pull = {
            team: data[1],
            repository: data[2],
            pullNumber: data[3],
            shareLink: data[4]
        };

        if (pull.shareLink) {
            pull.shareLink = pull.shareLink.toLowerCase();
        }

        if (_.get(pull, 'shareLink') === 'n' || _.get(pull, 'shareLink') === 'no') {
            logger.info('Skipped link', pull);
        } else {
            results.pulls.push(pull);
        }
        data = pullRegex.exec(message.text);
    }

    for (const pull of results.pulls) {
        const promiseGithub = getPull(pull.team, pull.repository, pull.pullNumber)
            .then((response) => {
                pull.title = response.data.title;
                pull.state = response.data.state;
                pull.commits = response.data.commits;
                pull.allow_squash_merge = response.data.allow_squash_merge;
                pull.additions = response.data.additions;
                pull.deletions = response.data.deletions;
            })
            .catch((err) => {
                logger.warn('Error getting pull from Github', err);
            });

        promises.push(promiseGithub);
    }

    Q.all(promises)
        .then(() => {
            deferred.resolve(results);
        })
        .catch((err) => {
            deferred.reject(err);
        });

    return deferred.promise;
};

module.exports = parser;
