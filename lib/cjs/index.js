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
const shouldSendEvent = (eventName, reqBody) => {
    const SENT_EVENT_KEY = `${constants_js_1.SENT_EVENT_ID_KEY}_${eventName}`;
    let lastSentEvent = localStorage.getItem(SENT_EVENT_KEY);
    if (!lastSentEvent) {
        return true;
    }
    const parsedEvent = JSON.parse(lastSentEvent);
    const nowTimestamp = Date.now();
    const timespanMillis = nowTimestamp - parsedEvent.timestamp;
    const sentEventExpired = timespanMillis > constants_js_1.SENT_EVENT_VALIDITY_PERIOD_MS;
    if (sentEventExpired) {
        return true;
    }
    const { tracking_id, project_id, referrer, source, category, title, tag, user_address } = reqBody.metadata;
    const eventMetadata = parsedEvent['metadata'];
    const eventMetadataMatches = eventMetadata['tracking_id'] === tracking_id &&
        eventMetadata['project_id'] === project_id &&
        eventMetadata['referrer'] === referrer &&
        eventMetadata['source'] === source &&
        eventMetadata['category'] === category &&
        eventMetadata['title'] === title &&
        eventMetadata['tag'] === tag;
    eventMetadata['user_address'] === user_address;
    return !eventMetadataMatches;
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
    var _a, _b, _c, _d, _e, _f;
    if (isBrowserUndefined) {
        return;
    }
    const queryParams = new URLSearchParams(window.location.search);
    localStorage.setItem(constants_js_1.REFERRER_ID_KEY, (_a = queryParams.get("referrer")) !== null && _a !== void 0 ? _a : "");
    localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, (_b = queryParams.get("source")) !== null && _b !== void 0 ? _b : "");
    localStorage.setItem(constants_js_1.TRAFFIC_CATEGORY_KEY, (_c = queryParams.get("category")) !== null && _c !== void 0 ? _c : "");
    localStorage.setItem(constants_js_1.TRAFFIC_TITLE_KEY, (_d = queryParams.get("title")) !== null && _d !== void 0 ? _d : "");
    localStorage.setItem(constants_js_1.TRAFFIC_TAG_KEY, (_e = queryParams.get("tag")) !== null && _e !== void 0 ? _e : "");
    localStorage.setItem(constants_js_1.TRAFFIC_ORIGIN_URL, (_f = document.referrer) !== null && _f !== void 0 ? _f : "");
    saveTrafficSource();
};
const saveTrafficSource = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const source = queryParams.get("source");
    const referrer = queryParams.get("referrer");
    if (source) {
        return;
    }
    if (referrer) {
        localStorage.setItem(constants_js_1.TRAFFIC_SOURCE_KEY, "affiliate");
        localStorage.setItem(constants_js_1.TRAFFIC_CATEGORY_KEY, "affiliate");
        localStorage.setItem(constants_js_1.TRAFFIC_TITLE_KEY, referrer);
    }
    else {
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
    }
};
const buildTrackingLinkQueryParams = (referrer, projectId) => {
    return `p=${projectId}&source=fuul&referrer=${referrer}`;
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
        this.httpClient = new HttpClient_js_1.HttpClient(Object.assign({ baseURL: settings.baseApiUrl || this.BASE_API_URL, timeout: 10000, apiKey: this.apiKey }, (this.settings.defaultQueryParams && { queryParams: this.settings.defaultQueryParams })));
        this.conversionService = new conversionService_js_1.ConversionService(this.httpClient);
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isBrowserUndefined) {
                return;
            }
            yield this.sendEvent("pageview");
        });
    }
    checkApiKey() {
        if (!this.apiKey) {
            throw new Error("Fuul API key is required");
        }
    }
    /**
     * @param {EventType} name Event name.
     * @param {EventArgs} args Event additional arguments.
     * @param {String} signature Event signature.
     * @param {String} signature_message Event signature message.
     * @returns {Promise<any>} Promise object represents the result of the event.
     * @example
     * ```js
     * import { Fuul } from 'fuul-sdk'
     *
     * // Initialize Fuul in your app root file
     * new Fuul('your-api-key')
     *
     * // Then you can send an event as follows:
     * fuul.sendEvent('my event', { value: 10 }, { user_address: '0x01' })
     * ```
     */
    sendEvent(name, args = {}, metadata = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const session_id = (0, localStorage_js_1.getSessionId)();
            const tracking_id = (0, localStorage_js_1.getTrackingId)();
            const referrerId = (0, localStorage_js_1.getReferrerId)();
            const source = (0, localStorage_js_1.getTrafficSource)();
            const category = (0, localStorage_js_1.getTrafficCategory)();
            const title = (0, localStorage_js_1.getTrafficTitle)();
            const tag = (0, localStorage_js_1.getTrafficTag)();
            const { userAddress, signature, signatureMessage } = metadata;
            if (!tracking_id)
                return;
            const reqBody = Object.assign(Object.assign(Object.assign({ name, event_args: args, metadata: Object.assign(Object.assign({}, (referrerId && { referrer: referrerId })), { session_id,
                    tracking_id,
                    source,
                    category,
                    title,
                    tag }) }, (userAddress && { user_address: userAddress })), (signature && { signature })), (signatureMessage && { signature_message: signatureMessage }));
            if (!shouldSendEvent(name, reqBody)) {
                return;
            }
            try {
                yield this.httpClient.post("events", reqBody);
                saveSentEvent(name, reqBody);
            }
            catch (error) {
                return error;
            }
        });
    }
    verifyConnection() {
        if (isBrowserUndefined) {
            throw new Error('Fuul SDK is not supported in this environment. Please use "typeof window !== undefined" to check if you are in the browser environment.');
        }
        window.alert("You are successfully connected to Fuul SDK! ✅");
    }
    /**
     * Generates a tracking link for a referrer
     * @param {Object} trackingLinkParams - Tracking link parameters
     * @param {string} trackingLinkParams.address - Referrer wallet address.
     * @param {string} trackingLinkParams.projectId - Project ID.
     * @param {string} trackingLinkParams.baseUrl - Base URL of your app. Defaults to window.location.href.
     * @returns {string} tracking link
     **/
    generateTrackingLink({ address, projectId, baseUrl, }) {
        return `${baseUrl !== null && baseUrl !== void 0 ? baseUrl : window.location.href}?${buildTrackingLinkQueryParams(address, projectId)}`;
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
