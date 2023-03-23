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
export class HttpClient {
    constructor(options) {
        this.client = axios.create(Object.assign(Object.assign({}, options), { headers: options.apiKey ? this._getHeaders(options.apiKey) : {} }));
    }
    get(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.get(path, { params });
        });
    }
    post(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.post(path, data);
        });
    }
    put(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.put(path, data);
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.delete(path);
        });
    }
    _getHeaders(apiKey) {
        const headers = {};
        headers.Authorization = `Bearer ${apiKey}`;
        return headers;
    }
}
