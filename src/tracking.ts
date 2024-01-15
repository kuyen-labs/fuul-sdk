import { nanoid } from 'nanoid';

const TRACKING_ID_KEY = 'fuul.tracking_id';

export const getTrackingId = () => getStoredOrcurrent(TRACKING_ID_KEY, () => nanoid());
export const getAffiliateId = () => getQueryParam('af') || getQueryParam('referrer');
export const getReferrerUrl = () => document.referrer;
export const getTrafficSource = () => detectSource();
export const getTrafficCategory = () => getQueryParam('category');
export const getTrafficTitle = () => getQueryParam('title');
export const getTrafficTag = () => getQueryParam('tag');

const getStoredOrcurrent = (key: string, currentValueFn: () => string): string => {
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
