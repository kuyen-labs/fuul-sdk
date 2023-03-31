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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const queryParams_js_1 = require("../../utils/queryParams.js");
class HttpClient {
    constructor(options) {
        this.client = axios_1.default.create(Object.assign(Object.assign({}, options), { headers: options.apiKey ? this._getHeaders(options.apiKey) : {} }));
        this.queryParams = options.queryParams
            ? (0, queryParams_js_1.buildQueryParams)(options.queryParams)
            : "";
    }
    get(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.get(path + this.queryParams, { params });
        });
    }
    post(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.post(path + this.queryParams, data);
        });
    }
    put(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.put(path + this.queryParams, data);
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.delete(path + this.queryParams);
        });
    }
    _getHeaders(apiKey) {
        const headers = {};
        headers.Authorization = `Bearer ${apiKey}`;
        return headers;
    }
}
exports.HttpClient = HttpClient;
