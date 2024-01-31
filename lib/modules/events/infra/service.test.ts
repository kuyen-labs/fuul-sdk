import 'jest-localstorage-mock';

import { HttpClient } from '../../http/client';
import { FuulEvent } from '../types';
import { EventService, SENT_EVENT_ID_KEY, SENT_EVENT_VALIDITY_PERIOD_SECONDS } from './service';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('EventService', () => {
  describe('isDuplicate', () => {
    it('with no previous event should return false', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const fuulEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      // Act
      const result = es.isDuplicate(fuulEvent);

      // Assert
      expect(result).toBe(false);
    });

    it('matching previous non-expired event should return true', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS + 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(true);
    });

    it('matching previous but expired event should return false', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22
      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS - 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(false);
    });

    it('with differing user_address should return false', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        user_address: '0x10',
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS + 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(false);
    });

    it('with differing signature should return false', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: '',
        args: {},
        user_address: '0x10',
        signature: 'some-signature',
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: {},
        user_address: '0x10',
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS + 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(false);
    });

    it('with same page should return true', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: 'some-event',
        args: { page: '/home' },
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: { page: '/home' },
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS + 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(true);
    });

    it('with differing page should return false', () => {
      // Arrange
      const httpClientMock = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      const newEvent: FuulEvent = {
        name: 'some-event',
        args: { page: '/checkout' },
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

      const prevEvent: FuulEvent = {
        name: 'some-event',
        args: { page: '/home' },
        metadata: {
          tracking_id: '123',
          project_id: 'test-project-id',
        },
      };

      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${prevEvent.name}`;
      const eventExtras = { timestamp: Date.now() / 1000 - SENT_EVENT_VALIDITY_PERIOD_SECONDS + 1 };
      localStorage.setItem(SENT_EVENT_KEY, JSON.stringify({ ...prevEvent, ...eventExtras }));

      // Act
      const result = es.isDuplicate(newEvent);

      // Assert
      expect(result).toBe(false);
    });
  });
});
