// src/commandParser.js

const commandParser = (commandText) => {
    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/casestack\/([a-z, A-Z, -]*)\/pull\/(\d*)/gm;
    let data = pullRegex.exec(commandText.text);
    const results = [];

    while (data != null) {
        const pull = {
            repository: data[1],
            pullNumber: data[2]
        };
        results.push(pull);
        data = pullRegex.exec(commandText.text);
    }

    return results;

};

module.exports = commandParser;
