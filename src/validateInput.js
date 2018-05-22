const bunyan = require('bunyan');
const _ = require('lodash');
const logger = bunyan.createLogger({name: 'reviewable-linker'});

const validateInput = (results) => {
    for (const pull of results.pulls) {
        if (_.isEmpty(pull.repository) || _.isEmpty(pull.pullNumber) || _.isEmpty(pull.team)) {
            logger.warn('Invalid pull url', pull);
            _.remove(results.pulls, pull);
        }
    }
    return results;
};

module.exports = validateInput;
