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
exports.CampaignsService = void 0;
const buildQueryParams = (args) => {
    let queryParams = "";
    Object.keys(args).forEach((key) => {
        queryParams =
            queryParams === ""
                ? queryParams + `${key}=${args[key]}`
                : queryParams + "&" + `${key}=${args[key]}`;
    });
    return queryParams;
};
class CampaignsService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    getAllCampaignsByProjectId(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const PATH = args ? `campaigns?${buildQueryParams(args)}` : `campaigns`;
            const { data } = yield this.httpClient.get(PATH);
            return data;
        });
    }
}
exports.CampaignsService = CampaignsService;
