import { nanoid } from 'nanoid';

const TRACKING_ID_KEY = 'fuul.tracking_id';
const AFFILIATE_ID_KEY = 'fuul.affiliate_id';
const TRAFFIC_SOURCE_KEY = 'fuul.traffic_source';
const TRAFFIC_CATEGORY_KEY = 'fuul.traffic_category';
const TRAFFIC_TITLE_KEY = 'fuul.traffic_title';
const TRAFFIC_TAG_KEY = 'fuul.traffic_tag';
const TRAFFIC_REFERRER_URL = 'fuul.traffic_referrer_url';

const SEARCH_ENGINE_URLS = ['google.com', 'bing.com', 'yahoo.com'];

export const getTrackingId = () => getStoredOrcurrent(TRACKING_ID_KEY, () => nanoid());
export const getAffiliateId = () =>
  getCurrentOrStored(() => getQueryParam('af') || getQueryParam('referrer'), AFFILIATE_ID_KEY);
export const getReferrerUrl = () => document.referrer;
export const getTrafficSource = () => getCurrentOrStored(() => detectSource(), TRAFFIC_SOURCE_KEY);
export const getTrafficCategory = () => getCurrentOrStored(() => getQueryParam('category'), TRAFFIC_CATEGORY_KEY);
export const getTrafficTitle = () => getCurrentOrStored(() => getQueryParam('title'), TRAFFIC_TITLE_KEY);
export const getTrafficTag = () => getCurrentOrStored(() => getQueryParam('tag'), TRAFFIC_TAG_KEY);

function getStoredOrcurrent(key: string, currentValueFn: () => string | null) {
  const storedValue = localStorage.getItem(key);

  if (storedValue) {
    return storedValue;
  } else {
    const currentValue = currentValueFn();
    return localStorage.setItem(key, currentValue || '');
    return currentValue;
  }
}

function getCurrentOrStored(currentValueFn: () => string | null, key: string) {
  const currentValue = currentValueFn();

  if (currentValue) {
    localStorage.setItem(key, currentValue);
    return currentValue;
  } else {
    return localStorage.getItem(key);
  }
}

function getQueryParam(key: string) {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(key);
}

function detectSource(): string {
  const source = getQueryParam('source');
  const affiliate = getQueryParam('af') || getQueryParam('referrer');
  console.log('DETECT SOURCE', affiliate);

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
}
