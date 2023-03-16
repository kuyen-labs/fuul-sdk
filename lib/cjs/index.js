"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fuul = void 0;
const axios_1 = __importDefault(require("axios"));
const date_1 = require("./utils/date");
const localStorage_1 = require("./utils/localStorage");
const constants_1 = require("./constants");
const saveSentEvent = (eventName, params) => {
    const timestamp = Date.now();
    const SENT_EVENT_KEY = `${constants_1.SENT_EVENT_ID_KEY}_${eventName}`;
    const eventParams = Object.assign(Object.assign({}, params), { timestamp });
    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
};
const isEventAlreadySentAndInValidTimestamp = (eventName, params) => {
    const SENT_EVENT_KEY = `${constants_1.SENT_EVENT_ID_KEY}_${eventName}`;
    const storedEvent = localStorage.getItem(SENT_EVENT_KEY);
    if (!storedEvent)
        return false;
    const parsedEvent = JSON.parse(storedEvent);
    const isSameDay = (0, date_1.datesAreOnSameDay)(new Date(Date.now()), new Date(parsedEvent.timestamp));
    if (eventName === "connect_wallet") {
        return parsedEvent["tracking_id"] === params.tracking_id && isSameDay;
    }
    else {
        return (parsedEvent["tracking_id"] === params.tracking_id &&
            parsedEvent["campaign_id"] === params.campaign_id &&
            parsedEvent["referrer_id"] === params.referrer_id &&
            isSameDay);
    }
};
const generateRandomId = () => __awaiter(void 0, void 0, void 0, function* () {
    const nanoid = yield Promise.resolve().then(() => __importStar(require("nanoid"))).then((m) => m.nanoid);
    return nanoid();
});
const saveSessionId = () => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(constants_1.SESSION_ID_KEY, yield generateRandomId());
});
const saveTrackingId = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (typeof window === "undefined" || typeof document === "undefined")
        return;
    const queryParams = new URLSearchParams(window.location.search);
    if (!queryParams.has("c") ||
        !queryParams.has("origin") ||
        !queryParams.has("r"))
        return;
    const isFuulOrigin = queryParams.get("origin") === "fuul";
    if (!isFuulOrigin)
        return;
    if (!(0, localStorage_1.getTrackingId)()) {
        localStorage.setItem(constants_1.TRACKING_ID_KEY, yield generateRandomId());
    }
    localStorage.setItem(constants_1.CAMPAIGN_ID_KEY, (_a = queryParams.get("c")) !== null && _a !== void 0 ? _a : "");
    localStorage.setItem(constants_1.REFERRER_ID_KEY, (_b = queryParams.get("r")) !== null && _b !== void 0 ? _b : "");
});
const buildTrackingLinkQueryParams = (r, c) => {
    return `c=${c}&origin=fuul&r=${r}`;
};
class Fuul {
    constructor(projectId) {
        this.BASE_API_URL = "https://api.fuul.xyz/api/v1";
        this.projectId = projectId;
        saveSessionId();
        saveTrackingId();
        globalThis.Fuul = this;
    }
    /**
     * @param {EventType} name Event name.
     * @param {EventArgsType} args Event additional arguments.
     * ```js
     * import { Fuul } from 'fuul-sdk'
     *
     * // Initialize Fuul in your app root file
     * new Fuul('your-project-id')
     *
     * // Then you can send an event as follows:
     * fuul.sendEvent('connect_wallet', {
     *    address,
     *    ...args
     * })
     * ```
     */
    sendEvent(name, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const session_id = (0, localStorage_1.getSessionId)();
            const tracking_id = (0, localStorage_1.getTrackingId)();
            const campaign_id = (0, localStorage_1.getCampaignId)();
            const referrer_id = (0, localStorage_1.getReferrerId)();
            if (!tracking_id)
                return;
            let params = {
                tracking_id,
            };
            let reqBody = {};
            if (name === "connect_wallet") {
                reqBody = {
                    name,
                    session_id,
                    event_args: Object.assign(Object.assign({}, args), { tracking_id }),
                };
            }
            else {
                if (!campaign_id || !referrer_id)
                    return;
                params = Object.assign(Object.assign({}, params), { referrer_id,
                    campaign_id });
                reqBody = {
                    name,
                    session_id,
                    project_id: (_a = this.projectId) !== null && _a !== void 0 ? _a : args === null || args === void 0 ? void 0 : args.project_id,
                    event_args: Object.assign(Object.assign({}, args), { referrer: referrer_id, campaign_id,
                        tracking_id }),
                };
            }
            if (isEventAlreadySentAndInValidTimestamp(name, params))
                return;
            const url = `${this.BASE_API_URL}/events`;
            try {
                const response = yield axios_1.default.post(url, reqBody);
                saveSentEvent(name, params);
                return response.data;
            }
            catch (error) {
                return error;
            }
        });
    }
    verifyConnection() {
        if (window !== undefined && globalThis.Fuul) {
            window.alert("You are successfully connected to Fuul SDK! ✅");
        }
    }
    /**
     * Generates a tracking link for a referrer
     * @param  {string} address referrer address
     * @param  {string} cid campaign id you want to refer the user
     * @param  {string} baseUrl base url of your app
     * @returns {string} tracking link
     */
    generateTrackingLink({ address, cid, baseUrl, }) {
        return `${baseUrl !== null && baseUrl !== void 0 ? baseUrl : window.location.href}?${buildTrackingLinkQueryParams(address, cid)}`;
    }
}
exports.Fuul = Fuul;
exports.default = {
    Fuul,
};
