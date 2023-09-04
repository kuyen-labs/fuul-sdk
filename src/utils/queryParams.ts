export const buildQueryParams = (args: Record<string, string>) => {
  let queryParams = '';

  Object.keys(args).forEach((key) => {
    queryParams = queryParams === '' ? queryParams + `?${key}=${args[key]}` : queryParams + '&' + `${key}=${args[key]}`;
  });

  return queryParams;
};
