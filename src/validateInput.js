// src/validateInput.js
const bunyan = require('bunyan')
const _ = require('lodash')
const logger = bunyan.createLogger({name: 'reviewable-linker'})

const validateInput = (results) => {
    for (const result of results) {
        logger.info(result)
        if ((result.repository === null && result.pullNumber === null) || (result.repository === '' && result.pullNumber === '')) {
            _.remove
        }
        if (result.repository === null || result.repository === '') {
            logger.warn(result, 'Incomplete URL')
            _.remove(results, result)
        }
        if (result.pullNumber === null || result.pullNumber === '') {
            logger.warn(result, 'Incomplete URL')
            _.remove(results, result)
        }
    }
    return results
}

module.exports = validateInput
