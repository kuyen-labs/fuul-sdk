import {
  PROJECT_ID_KEY,
  REFERRER_ID_KEY,
  SESSION_ID_KEY,
  TRACKING_ID_KEY,
  TRAFFIC_CATEGORY_KEY,
  TRAFFIC_SOURCE_KEY,
  TRAFFIC_TAG_KEY,
  TRAFFIC_TITLE_KEY,
} from '../constants'

export const getSessionId = () => localStorage.getItem(SESSION_ID_KEY)
export const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY)
export const getProjectId = () => localStorage.getItem(PROJECT_ID_KEY)
export const getReferrerId = () => localStorage.getItem(REFERRER_ID_KEY)
export const getTrafficSource = () => localStorage.getItem(TRAFFIC_SOURCE_KEY)
export const getTrafficCategory = () => localStorage.getItem(TRAFFIC_CATEGORY_KEY)
export const getTrafficTitle = () => localStorage.getItem(TRAFFIC_TITLE_KEY)
export const getTrafficTag = () => localStorage.getItem(TRAFFIC_TAG_KEY)
