interface IParsedUrl {
    organization?: string;
    repository?: string;
    pullNumber?: number;
    shareLink?: string;
}

interface IGithubMessage {
    channel: string;
    type: string;
    user: string;
    pulls: IGithubDTO[];
    ts: string;
}

interface IGithubDTO extends IParsedUrl {
    title: string;
    state: string;
    merged: boolean;
    commits: number;
    additions: number;
    deletions: number;
    additionsEmoji?: string;
    deletionsEmoji?: string;
}

interface ISlackMessageDTO {
    type: string;
    channel: string;
    user: string;
    text: string;
    ts: string;
    thread_ts?: string;
}

interface ISendSlackMessageDTO {
    id: number;
    type: string;
    channel: string;
    text: string;
    thread_ts?: string;
}

interface ISlackReactionDTO {
    type: string;
    user: string;
    item: {
        type: string;
        channel: string;
        ts: string;
    };
    reaction: string;
    item_user: string;
    event_ts: string;
    ts: string;
}

export {
    IParsedUrl,
    IGithubDTO,
    ISlackMessageDTO,
    ISendSlackMessageDTO,
    IGithubMessage,
    ISlackReactionDTO
};
