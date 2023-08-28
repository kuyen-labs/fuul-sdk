import { nanoid } from 'nanoid';

import {
  AFFILIATE_ID_KEY,
  PROJECT_ID_KEY,
  SEARCH_ENGINE_URLS,
  TRACKING_ID_KEY,
  TRAFFIC_CATEGORY_KEY,
  TRAFFIC_REFERRER_URL,
  TRAFFIC_SOURCE_KEY,
  TRAFFIC_TAG_KEY,
  TRAFFIC_TITLE_KEY,
} from '../constants';

export const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);
export const getProjectId = () => localStorage.getItem(PROJECT_ID_KEY);
export const getAffiliateId = () => localStorage.getItem(AFFILIATE_ID_KEY);
export const getTrafficSource = () => localStorage.getItem(TRAFFIC_SOURCE_KEY);
export const getTrafficCategory = () => localStorage.getItem(TRAFFIC_CATEGORY_KEY);
export const getTrafficTitle = () => localStorage.getItem(TRAFFIC_TITLE_KEY);
export const getTrafficTag = () => localStorage.getItem(TRAFFIC_TAG_KEY);
export const getTrafficReferrerUrl = () => localStorage.getItem(TRAFFIC_REFERRER_URL);

export const isBrowserUndefined = typeof window === 'undefined' || typeof document === 'undefined';

const generateRandomId = () => nanoid();

export const saveTrackingId = (): void => {
  if (isBrowserUndefined) {
    return;
  }

  if (!getTrackingId()) {
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId());
  }
};

export const saveUrlParams = (): void => {
  if (isBrowserUndefined) {
    return;
  }

  const queryParams = new URLSearchParams(window.location.search);

  localStorage.setItem(AFFILIATE_ID_KEY, getAffiliate() ?? '');
  localStorage.setItem(TRAFFIC_SOURCE_KEY, queryParams.get('source') ?? detectSource());
  localStorage.setItem(TRAFFIC_CATEGORY_KEY, queryParams.get('category') ?? '');
  localStorage.setItem(TRAFFIC_TITLE_KEY, queryParams.get('title') ?? '');
  localStorage.setItem(TRAFFIC_TAG_KEY, queryParams.get('tag') ?? '');
  localStorage.setItem(TRAFFIC_REFERRER_URL, document.referrer ?? '');
};

function getAffiliate(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('affiliate') ?? queryParams.get('referrer');
}

function detectSource(): string {
  const queryParams = new URLSearchParams(window.location.search);
  const source = queryParams.get('source');
  const affiliate = getAffiliate();

  if (source) {
    return 'custom';
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
