const getPull = require('./github.js');
const bunyan = require('bunyan');
const logger = bunyan.createLogger({name: 'reviewable-linker'});

const parser = (message) => {
    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/([a-z, A-Z, 0-9, -]*)\/([a-z, A-Z, 0-9, -]*)\/pull\/(\d*)/gm;
    let data = pullRegex.exec(message.text);

    const results = [];

    while (data != null) {
        const team = data[1];
        const repository = data[2];
        const pullNumber = data[3];

        const pull = {
            team,
            repository,
            pullNumber
        };

        getPull(team, repository, pullNumber)
        .then((response, pull) => {
            pull.additions = response.data.additions;
            pull.deletions = response.data.deletions;
        })
        .catch((err) => {
            logger.warn('Error getting pull from Github', err);
        })
        .finally(() => {
            results.push(pull);
        });

        data = pullRegex.exec(message.text);
    }

    return results;

};

module.exports = parser;
