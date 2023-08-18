import { nanoid } from 'nanoid'

import {
  PROJECT_ID_KEY,
  REFERRER_ID_KEY,
  SEARCH_ENGINE_URLS,
  SESSION_ID_KEY,
  TRACKING_ID_KEY,
  TRAFFIC_CATEGORY_KEY,
  TRAFFIC_ORIGIN_URL,
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

export const isBrowserUndefined = typeof window === 'undefined' || typeof document === 'undefined'

const generateRandomId = () => nanoid()

export const saveSessionId = (): void => {
  if (isBrowserUndefined) {
    return
  }

  localStorage.setItem(SESSION_ID_KEY, generateRandomId())
}

export const saveTrackingId = (): void => {
  if (isBrowserUndefined) {
    return
  }

  if (!getTrackingId()) {
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId())
  }
}

export const saveUrlParams = (): void => {
  if (isBrowserUndefined) {
    return
  }

  const queryParams = new URLSearchParams(window.location.search)

  localStorage.setItem(REFERRER_ID_KEY, queryParams.get('referrer') ?? '')
  localStorage.setItem(TRAFFIC_SOURCE_KEY, queryParams.get('source') ?? '')
  localStorage.setItem(TRAFFIC_CATEGORY_KEY, queryParams.get('category') ?? '')
  localStorage.setItem(TRAFFIC_TITLE_KEY, queryParams.get('title') ?? '')
  localStorage.setItem(TRAFFIC_TAG_KEY, queryParams.get('tag') ?? '')
  localStorage.setItem(TRAFFIC_ORIGIN_URL, document.referrer ?? '')

  saveTrafficSource()
}

export const saveTrafficSource = (): void => {
  const queryParams = new URLSearchParams(window.location.search)
  const source = queryParams.get('source')
  const referrer = queryParams.get('referrer')

  if (source) {
    return
  }

  if (referrer) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, 'affiliate')
    localStorage.setItem(TRAFFIC_CATEGORY_KEY, 'affiliate')
    localStorage.setItem(TRAFFIC_TITLE_KEY, referrer)
  } else {
    // if traffic source is not defined
    const originURL = document.referrer

    localStorage.setItem(TRAFFIC_CATEGORY_KEY, originURL)
    localStorage.setItem(TRAFFIC_TITLE_KEY, originURL)

    // if traffic source is a search engine
    if (SEARCH_ENGINE_URLS.includes(originURL)) {
      localStorage.setItem(TRAFFIC_SOURCE_KEY, 'organic')
    } else {
      // if traffic source is direct
      localStorage.setItem(TRAFFIC_SOURCE_KEY, 'direct')
    }
  }
}
