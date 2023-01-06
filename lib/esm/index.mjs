var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// vendors
import axios from "axios";
const SESSION_ID_KEY = "fuul.session_id";
const TRACKING_ID_KEY = "fuul.tracking_id";
const getSessionId = () => localStorage.getItem(SESSION_ID_KEY);
const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);
export class Fuul {
    constructor(projectId) {
        this.BASE_API_URL = 'http://fuul-server-production-lb-1150554069.us-east-1.elb.amazonaws.com/api/v1';
        this.project_id = projectId;
        this.saveSessionId();
        this.saveTrackingId();
    }
    generateRandomId() {
        return __awaiter(this, void 0, void 0, function* () {
            const { nanoid } = yield import('nanoid');
            return nanoid();
        });
    }
    ;
    sendEvent(name, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const session_id = getSessionId();
            const tracking_id = getTrackingId();
            if (!session_id) {
                throw new Error('fuul.session_id is missing');
            }
            if (!tracking_id) {
                throw new Error('fuul.tracking_id is missing');
            }
            const reqBody = {
                name,
                session_id,
                project_id: this.project_id,
                event_args: Object.assign(Object.assign({}, args), { tracking_id })
            };
            const url = `${this.BASE_API_URL}/events`;
            try {
                const response = yield axios.post(url, reqBody);
                return response;
            }
            catch (error) {
                return error;
            }
        });
    }
    saveSessionId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof window === "undefined")
                return;
            localStorage.setItem(SESSION_ID_KEY, yield this.generateRandomId());
        });
    }
    saveTrackingId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof window === 'undefined' ||
                typeof document === 'undefined')
                return;
            if (!document.referrer)
                return;
            const queryParams = new URLSearchParams(window.location.search);
            if (!(queryParams.has('c') || queryParams.has('r')))
                return;
            localStorage.setItem(TRACKING_ID_KEY, yield this.generateRandomId());
            this.sendEvent('pageview');
        });
    }
}
export default {
    Fuul,
};
