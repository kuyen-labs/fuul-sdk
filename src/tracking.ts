import { nanoid } from 'nanoid';

const TRACKING_ID_KEY = 'fuul.tracking_id';

const SEARCH_ENGINE_URLS = ['google.com', 'bing.com', 'yahoo.com'];

export const getTrackingId = () => getStoredOrcurrent(TRACKING_ID_KEY, () => nanoid());
export const getAffiliateId = () => getQueryParam('af') || getQueryParam('referrer');
export const getReferrerUrl = () => document.referrer;
export const getTrafficSource = () => detectSource();
export const getTrafficCategory = () => getQueryParam('category');
export const getTrafficTitle = () => getQueryParam('title');
export const getTrafficTag = () => getQueryParam('tag');

const getStoredOrcurrent = (key: string, currentValueFn: () => string | null) => {
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    return storedValue;
  } else {
    const currentValue = currentValueFn();
    if (currentValue) {
      localStorage.setItem(key, currentValue);
    } else {
      localStorage.removeItem(key);
    }
    return currentValue;
  }
};

const getQueryParam = (key: string) => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(key);
};

const detectSource = (): string => {
  const source = getQueryParam('source');
  const affiliate = getQueryParam('af') || getQueryParam('referrer');

  if (source) {
    return source;
  }

  if (affiliate) {
    return 'affiliate';
  }

  const referrerUrl = document.referrer;
  if (SEARCH_ENGINE_URLS.includes(referrerUrl)) {
    return 'organic';
  }

  return 'direct';
};
