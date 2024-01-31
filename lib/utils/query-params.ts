export const getQueryParam = (key: string) => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(key);
};

export const detectSource = (): string | undefined => {
  const sourceParam = getQueryParam('source');
  if (sourceParam) {
    return sourceParam;
  }
};

export const getAffiliateId = () => getQueryParam('af') || getQueryParam('referrer');
export const getReferrerUrl = () => document.referrer;
export const getTrafficCategory = () => getQueryParam('category');
export const getTrafficSource = () => detectSource();
export const getTrafficTag = () => getQueryParam('tag');
export const getTrafficTitle = () => getQueryParam('title');
