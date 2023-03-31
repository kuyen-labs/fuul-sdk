"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQueryParams = void 0;
const buildQueryParams = (args) => {
    let queryParams = "";
    Object.keys(args).forEach((key) => {
        queryParams =
            queryParams === ""
                ? queryParams + `?${key}=${args[key]}`
                : queryParams + "&" + `${key}=${args[key]}`;
    });
    return queryParams;
};
exports.buildQueryParams = buildQueryParams;
