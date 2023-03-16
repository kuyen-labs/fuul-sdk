import {
  CAMPAIGN_ID_KEY,
  REFERRER_ID_KEY,
  SESSION_ID_KEY,
  TRACKING_ID_KEY,
} from "../constants.js";

export const getSessionId = () => localStorage.getItem(SESSION_ID_KEY);
export const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);
export const getCampaignId = () => localStorage.getItem(CAMPAIGN_ID_KEY);
export const getReferrerId = () => localStorage.getItem(REFERRER_ID_KEY);
