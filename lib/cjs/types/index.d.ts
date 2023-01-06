import { EventArgsType, EventType } from "./types/types";
export declare class Fuul {
    project_id: string;
    private BASE_API_URL;
    constructor(projectId: string);
    private generateRandomId;
    sendEvent(name: EventType, args?: EventArgsType): Promise<unknown>;
    private saveSessionId;
    private saveTrackingId;
}
declare const _default: {
    Fuul: typeof Fuul;
};
export default _default;
//# sourceMappingURL=index.d.ts.map