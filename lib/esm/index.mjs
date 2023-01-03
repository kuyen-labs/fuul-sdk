var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
const SESSION_ID_KEY = "fuul.sessionId";
export class Fuul {
    constructor(projectId, serverUrl) {
        this.projectId = projectId;
        this.serverUrl = serverUrl;
        this.saveSessionId();
    }
    generateSessionId() {
        return "test_session_id";
    }
    sendEvent(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const session_id = this.generateSessionId();
            try {
                const response = yield axios.post(this.serverUrl, Object.assign(Object.assign({}, params), { session_id }));
                return response;
            }
            catch (error) {
                return error;
            }
        });
    }
    saveSessionId() {
        if (typeof window === "undefined")
            return;
        const session_id = localStorage.getItem(SESSION_ID_KEY);
        if (session_id)
            return;
        localStorage.setItem(SESSION_ID_KEY, this.generateSessionId());
    }
}
export default {
    Fuul,
};
