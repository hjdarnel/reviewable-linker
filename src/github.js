const GitHubApi = require('github');
const token = process.env.AUTH_TOKEN || '';
const bunyan = require('bunyan');
const logger = bunyan.createLogger({name: 'reviewable-linker'});
const Q = require('q');

if (!token) {
    logger.error('missing environment variable AUTH_TOKEN');
    process.exit(1);
}

var github = new GitHubApi({
    host: 'api.github.com',
    protocol: 'https'
});

// oauth
github.authenticate({
    type: 'oauth',
    token
});

const getPull = (team, repository, pullNumber) => {
    const deferred = Q.defer();

    github.pullRequests.get({owner: team, repo: repository, number: pullNumber})
    .then((pull) => {
        deferred.resolve(pull);
    })
    .catch((err) => {
        deferred.reject(err);
    });

    return deferred.promise;
};

module.exports = getPull;