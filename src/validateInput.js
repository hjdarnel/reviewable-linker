const bunyan = require('bunyan');
const _ = require('lodash');

const projectId = 'piproject-179120';
const loggingBunyan = require('@google-cloud/logging-bunyan')({
    projectId: projectId,
    keyFilename: './piProject-9ab7aee26f73.json'
});

const logger = bunyan.createLogger({
    name: 'reviewable-linker',
    streams: [
        loggingBunyan.stream('info')
    ]
});

const validateInput = (results) => {
    for (const result of results) {
        if ((result.repository === null && result.pullNumber === null && result.team === null) || (result.repository === '' && result.pullNumber === '' && result.team === '')) {
            _.remove;
        }
        if (result.repository === null || result.repository === '') {
            logger.warn(result, 'Incomplete URL, missing repository');
            _.remove(results, result);
        }
        if (result.pullNumber === null || result.pullNumber === '') {
            logger.warn(result, 'Incomplete URL, missing pull number');
            _.remove(results, result);
        }
        if (result.team === null || result.team === '') {
            logger.warn(result, 'Incomplete URL, missing team');
            _.remove(results, result);
        }
    }
    return results;
};

module.exports = validateInput;
