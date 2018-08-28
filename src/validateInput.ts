import * as bunyan from 'bunyan';
import * as _ from 'lodash';
import { IGithubMessage } from './interface';

const logger = bunyan.createLogger({ name: 'reviewable-linker' });

const validateInput = (message: IGithubMessage) => {
    for (const pull of message.pulls) {
        logger.info(pull, 'here');
        if (!pull.repository || !pull.pullNumber || !pull.organization) {
            logger.warn('Invalid pull url', pull);
            _.remove(message.pulls, pull);
        }
    }
    return message;
};

export default validateInput;
