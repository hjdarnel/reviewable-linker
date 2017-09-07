const parser = (message) => {
    const pullRegex = /http(?:s)?:\/\/(?:www\.)?github\.com\/([a-z, A-Z, 0-9, -]*)\/([a-z, A-Z, 0-9, -]*)\/pull\/(\d*)/gm;
    let data = pullRegex.exec(message.text);
    const results = [];

    while (data != null) {
        const pull = {
            team: data[1],
            repository: data[2],
            pullNumber: data[3]
        };
        results.push(pull);
        data = pullRegex.exec(message.text);
    }

    return results;

};

module.exports = parser;
