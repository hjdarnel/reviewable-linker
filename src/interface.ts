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

export { IParsedUrl, IGithubDTO, ISlackMessageDTO, ISendSlackMessageDTO, IGithubMessage };
