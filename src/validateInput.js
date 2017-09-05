// src/validateInput.js
const bunyan = require('bunyan')
const _ = require('lodash')
const logger = bunyan.createLogger({name: 'reviewable-linker'})

const validateInput = (results) => {
    for (const result of results) {
        if (result.repository === null && result.pullNumber === null) {
            _.remove
        }
        if (result.repository === null) {
            logger.warn(result, 'Incomplete URL')
            _.remove(results, result)
        }
        if (result.pullNumber === null) {
            logger.warn(result, 'Incomplete URL')
            _.remove(results, result)
        }
    }
    return results
}

module.exports = validateInput
