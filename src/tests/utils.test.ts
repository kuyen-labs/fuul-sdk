/**
 * @jest-environment jsdom
 */

import 'jest-localstorage-mock';

import { SENT_EVENT_ID_KEY } from '../constants';
import { shouldSendEvent } from '../utils/events';
import { FuulEvent } from '../types/api';

jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

let fuulEvent: FuulEvent;
const eventName = 'pageview';

beforeEach(() => {
  fuulEvent = {
    name: 'pageview',
    event_args: {},
    metadata: {
      tracking_id: '123',
      project_id: 'test-project-id',
    },
  };
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('shouldSendEvent', () => {
  it('should return true if event is not sent before', () => {
    const result = shouldSendEvent(fuulEvent);

    expect(result).toBe(true);
  });

  it('should return true if sent event is expired', () => {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
    const eventParams = { ...fuulEvent, timestamp: 1626921000000 }; // Older timestamp (2021-07-22T00:50:00.000Z)

    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));

    const result = shouldSendEvent(fuulEvent);

    expect(result).toBe(true);
  });

  it('should return false if event metadata matches the sent event', () => {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
    const eventParams = { ...fuulEvent, timestamp: 1626921700000 }; // Recent timestamp (2021-07-22T00:55:00.000Z)

    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));

    const result = shouldSendEvent(fuulEvent);

    expect(result).toBe(false);
  });
});
