export const buildQueryParams = (args) => {
    let queryParams = "";
    Object.keys(args).forEach((key) => {
        queryParams =
            queryParams === ""
                ? queryParams + `?${key}=${args[key]}`
                : queryParams + "&" + `${key}=${args[key]}`;
    });
    return queryParams;
};
