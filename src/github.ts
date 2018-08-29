import GitHubApi = require('github');
import bunyan = require('bunyan');
import { IGithubDTO, IParsedUrl } from './interface';

const token = process.env.AUTH_TOKEN || '';
const logger = bunyan.createLogger({ name: 'reviewable-linker' });

if (!token) {
    logger.error('missing environment variable AUTH_TOKEN');
    process.exit(1);
}

const github = new GitHubApi({
    host: 'api.github.com',
    protocol: 'https'
});

// oauth
github.authenticate({
    type: 'oauth',
    token
});

const getPull = async ({
    organization,
    repository,
    pullNumber
}: IParsedUrl): Promise<IGithubDTO> => {
    return await github.pullRequests
        .get({ owner: organization, repo: repository, number: pullNumber })
        .then(response => {
            return {
                title: response.data.title,
                state: response.data.state,
                commits: response.data.commits,
                additions: response.data.additions,
                deletions: response.data.deletions,
                merged: response.data.merged
            };
        })
        .catch(err => {
            throw err;
        });
};

export { getPull };
