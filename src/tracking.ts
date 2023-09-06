import { nanoid } from 'nanoid';

const TRACKING_ID_KEY = 'fuul.tracking_id';
const AFFILIATE_ID_KEY = 'fuul.affiliate_id';
const TRAFFIC_SOURCE_KEY = 'fuul.traffic_source';
const TRAFFIC_CATEGORY_KEY = 'fuul.traffic_category';
const TRAFFIC_TITLE_KEY = 'fuul.traffic_title';
const TRAFFIC_TAG_KEY = 'fuul.traffic_tag';
const TRAFFIC_REFERRER_URL = 'fuul.traffic_referrer_url';

const SEARCH_ENGINE_URLS = ['google.com', 'bing.com', 'yahoo.com'];

export const getTrackingId = () => getTrackingParam(TRACKING_ID_KEY, () => nanoid());
export const getAffiliateId = () => getTrackingParam(AFFILIATE_ID_KEY, () => getAffiliate() ?? '');
export const getReferrerUrl = () => getTrackingParam(TRAFFIC_REFERRER_URL, () => document.referrer);
export const getTrafficSource = () => getTrackingParam(TRAFFIC_SOURCE_KEY, detectSource);
export const getTrafficCategory = () => getTrackingParam(TRAFFIC_CATEGORY_KEY, () => getQueryParam('category') ?? '');
export const getTrafficTitle = () => getTrackingParam(TRAFFIC_TITLE_KEY, () => getQueryParam('title') ?? '');
export const getTrafficTag = () => getTrackingParam(TRAFFIC_TAG_KEY, () => getQueryParam('tag') ?? '');

function getTrackingParam(key: string, initFn: () => string) {
  const lsValue = localStorage.getItem(key);
  if (lsValue) {
    return lsValue;
  }

  const newVal = initFn();
  localStorage.setItem(key, newVal);
  return newVal;
}

function getQueryParam(key: string) {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(key);
}

function getAffiliate(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('affiliate') ?? queryParams.get('referrer');
}

function detectSource(): string {
  const queryParams = new URLSearchParams(window.location.search);
  const source = queryParams.get('source');
  const affiliate = getAffiliate();

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
