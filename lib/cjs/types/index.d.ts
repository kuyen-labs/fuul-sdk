type EventParamsType = {
    name: string;
    project_id: string;
    event_args?: {
        address?: string;
        message?: string;
    };
};
export declare class Fuul {
    projectId: string;
    serverUrl: string;
    constructor(projectId: string, serverUrl: string);
    generateSessionId(): string;
    sendEvent(params: EventParamsType): Promise<unknown>;
    saveSessionId(): void;
}
declare const _default: {
    Fuul: typeof Fuul;
};
export default _default;
//# sourceMappingURL=index.d.ts.map