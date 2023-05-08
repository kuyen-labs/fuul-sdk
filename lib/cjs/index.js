"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fuul = void 0;
const nanoid_1 = require("nanoid");
const localStorage_js_1 = require("./utils/localStorage.js");
const constants_js_1 = require("./constants.js");
const HttpClient_js_1 = require("./infrastructure/http/HttpClient.js");
const conversionService_js_1 = require("./infrastructure/conversions/conversionService.js");
const saveSentEvent = (eventName, params) => {
    const timestamp = Date.now();
    const SENT_EVENT_KEY = `${constants_js_1.SENT_EVENT_ID_KEY}_${eventName}`;
    const eventParams = Object.assign(Object.assign({}, params), { timestamp });
    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
};
const shouldEventBeSent = (eventName, params) => {
    const SENT_EVENT_KEY = `${constants_js_1.SENT_EVENT_ID_KEY}_${eventName}`;
    const sentEvent = localStorage.getItem(SENT_EVENT_KEY);
    if (!sentEvent) {
        return true;
    }
    const parsedEvent = JSON.parse(sentEvent);
    const nowTimestamp = Date.now();
    const timespanMillis = nowTimestamp - parsedEvent.timestamp;
    const sentEventExpired = timespanMillis > constants_js_1.SENT_EVENT_VALIDITY_PERIOD_MS;
    if (sentEventExpired) {
        return true;
    }
    let eventArgsMatch = false;
    if (eventName === "connect_wallet") {
        eventArgsMatch =
            parsedEvent["tracking_id"] === params.tracking_id &&
                parsedEvent["address"] === params.address;
    }
    else {
        eventArgsMatch =
            parsedEvent["tracking_id"] === params.tracking_id &&
                parsedEvent["project_id"] === params.project_id &&
                parsedEvent["referrer_id"] === params.referrer_id &&
                parsedEvent["source"] === params.source &&
                parsedEvent["category"] === params.category &&
                parsedEvent["title"] === params.title &&
                parsedEvent["tag"] === params.tag;
    }
    return !eventArgsMatch;
};
const generateRandomId = () => (0, nanoid_1.nanoid)();
const isBrowserUndefined = typeof window === "undefined" || typeof document === "undefined";
const saveSessionId = () => {
    if (isBrowserUndefined) {
        return;
    }
    localStorage.setItem(constants_js_1.SESSION_ID_KEY, generateRandomId());
};
const saveTrackingId = () => {
    if (isBrowserUndefined) {
        return;
    }
    if (!(0, localStorage_js_1.getTrackingId)()) {
        localStorage.setItem(constants_js_1.TRACKING_ID_KEY, generateRandomId());
    }
};
const saveUrlParams = () => {
    var _a, _b, _c;
    if (isBrowserUndefined) {
        return;
    }
    const queryParams = new URLSearchParams(window.location.search);
    saveTrafficSource(queryParams);
    localStorage.setItem(constants_js_1.TRAFFIC_CATEGORY_KEY, (_a = queryParams.get("category")) !== null && _a !== void 0 ? _a : "");
    localStorage.setItem(constants_js_1.TRAFFIC_TITLE_KEY, (_b = queryParams.get("title")) !== null && _b !== void 0 ? _b : "");
    localStorage.setItem(constants_js_1.TRAFFIC_TAG_KEY, (_c = queryParams.get("tag")) !== null && _c !== void 0 ? _c : "");
};
const saveTrafficSource = (queryParams) => {
    const trafficSourceParam = queryParams.get("source");
    const referrerParam = queryParams.get("r");
    // if is an affiliate link
    if (referrerParam) {
        localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, "affiliate");
        localStorage.setItem(constants_js_1.TRAFFIC_CATEGORY_KEY, "affiliate");
        localStorage.setItem(constants_js_1.TRAFFIC_TITLE_KEY, referrerParam);
        localStorage.setItem(constants_js_1.REFERRER_ID_KEY, referrerParam);
        return;
    }
    // if traffic source is defined
    if (trafficSourceParam) {
        localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, trafficSourceParam);
        return;
    }
    // if traffic source is not defined
    const originURL = document.referrer;
    localStorage.setItem(constants_js_1.TRAFFIC_CATEGORY_KEY, originURL);
    localStorage.setItem(constants_js_1.TRAFFIC_TITLE_KEY, originURL);
    // if traffic source is a search engine
    if (constants_js_1.SEARCH_ENGINE_URLS.includes(originURL)) {
        localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, "organic");
    }
    else {
        // if traffic source is direct
        localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, "direct");
    }
};
class Fuul {
    constructor(apiKey, settings = {}) {
        this.BASE_API_URL = "https://api.fuul.xyz/api/v1/";
        this.apiKey = apiKey;
        this.settings = settings;
        this.checkApiKey();
        saveSessionId();
        saveTrackingId();
        saveUrlParams();
        this.httpClient = new HttpClient_js_1.HttpClient(Object.assign({ baseURL: this.BASE_API_URL, timeout: 10000, apiKey: this.apiKey }, (this.settings.defaultQueryParams &&
            typeof this.settings.defaultQueryParams !== "string" && {
            queryParams: this.settings.defaultQueryParams,
        })));
        this.conversionService = new conversionService_js_1.ConversionService(this.httpClient);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            globalThis.Fuul = this;
            if (typeof window !== "undefined") {
                yield this.sendEvent("pageview");
            }
        });
    }
    checkApiKey() {
        if (!this.apiKey) {
            throw new Error("Fuul API key is required");
        }
    }
    /**
     * @param {EventType} name Event name.
     * @param {EventArgsType} args Event additional arguments.
     * @param {String} signature Event signature.
     * @param {String} signature_message Event signature message.
     * ```js
     * import { Fuul } from 'fuul-sdk'
     *
     * // Initialize Fuul in your app root file
     * new Fuul('your-api-key')
     *
     * // Then you can send an event as follows:
     * fuul.sendEvent('connect_wallet', {
     *    address,
     *    ...args
     * })
     * ```
     */
    sendEvent(name, args, signature, signature_message) {
        return __awaiter(this, void 0, void 0, function* () {
            const session_id = (0, localStorage_js_1.getSessionId)();
            const tracking_id = (0, localStorage_js_1.getTrackingId)();
            const referrer_id = (0, localStorage_js_1.getReferrerId)();
            if (!tracking_id)
                return;
            let params = {
                tracking_id,
            };
            let reqBody = {};
            if (name === "connect_wallet") {
                params = Object.assign(Object.assign({}, params), { address: args === null || args === void 0 ? void 0 : args.address });
                reqBody = {
                    name,
                    session_id,
                    event_args: Object.assign(Object.assign({}, args), { tracking_id }),
                };
            }
            else {
                const source = (0, localStorage_js_1.getTrafficSource)();
                const category = (0, localStorage_js_1.getTrafficCategory)();
                const title = (0, localStorage_js_1.getTrafficTitle)();
                const tag = (0, localStorage_js_1.getTrafficTag)();
                params = Object.assign(Object.assign({}, params), { project_id: args === null || args === void 0 ? void 0 : args.project_id, referrer_id,
                    source,
                    category,
                    title,
                    tag });
                reqBody = {
                    name,
                    session_id,
                    event_args: Object.assign(Object.assign({}, args), { referrer: referrer_id, tracking_id,
                        source,
                        category,
                        title,
                        tag }),
                };
            }
            reqBody = Object.assign(Object.assign(Object.assign({}, reqBody), (signature && {
                signature,
            })), (signature_message && {
                signature_message,
            }));
            if (!shouldEventBeSent(name, params)) {
                return;
            }
            try {
                yield this.httpClient.post("events", reqBody);
                saveSentEvent(name, params);
            }
            catch (error) {
                return error;
            }
        });
    }
    verifyConnection() {
        if (typeof window !== undefined && globalThis.Fuul) {
            window.alert("You are successfully connected to Fuul SDK! ✅");
        }
    }
    getAllConversions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.conversionService.getAll();
        });
    }
}
exports.Fuul = Fuul;
exports.default = {
    Fuul,
};
