const getPull = require('./github.js');
const bunyan = require('bunyan');
const Q = require('q');
const logger = bunyan.createLogger({name: 'reviewable-linker'});

const parser = (message) => {
    const deferred = Q.defer();
    const results = [];
    const pulls = [];
    const promises = [];

    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/([a-z, A-Z, 0-9, -]*)\/([a-z, A-Z, 0-9, -]*)\/pull\/(\d*)/gm;
    let data = pullRegex.exec(message.text);

    while (data != null) {
        const pull = {
            team: data[1],
            repository: data[2],
            pullNumber: data[3]
        };

        pulls.push(pull);
        data = pullRegex.exec(message.text);
    }


    for (const pull of pulls) {
        promises.push(
            getPull(pull.team, pull.repository, pull.pullNumber)
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
            })
            .finally(() => {
                results.push(pull);
            })
        );
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
