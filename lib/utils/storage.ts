import { nanoid } from 'nanoid';

const TRACKING_ID_KEY = 'fuul.tracking_id';

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

export const getTrackingId = () => getStoredOrcurrent(TRACKING_ID_KEY, () => nanoid());
