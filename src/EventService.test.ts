import 'jest-localstorage-mock';

import { EventService, SENT_EVENT_ID_KEY, SENT_EVENT_VALIDITY_PERIOD_SECONDS } from './EventService';
import { HttpClient } from './HttpClient';
import { FuulEvent } from './types/api';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('EventService', () => {
  describe('sendEvent', () => {
    it(`posts event`, async () => {
      // Arrange
      const httpClientMock = {
        post: jest.fn().mockResolvedValue(null),
      };

      httpClientMock.post = jest.fn();
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
      await es.sendEvent(fuulEvent);

      // Assert
      const postCalls = httpClientMock.post.mock.calls;
      expect(postCalls.length).toEqual(1);

      const request = postCalls[0][0];
      expect(request.postData.project_id).toBeUndefined();
      expect(request.postData.metadata).toEqual(expect.objectContaining({ project_id: 'test-project-id' }));
    });

    describe('multi-project', () => {
      it(`posts one event per project`, async () => {
        // Arrange
        const httpClientMock = {
          post: jest.fn().mockResolvedValue(null),
        };

        httpClientMock.post = jest.fn();
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
        await es.sendEvent(fuulEvent, ['projectId1', 'projectId2']);

        // Assert
        const postCalls = httpClientMock.post.mock.calls;
        expect(postCalls.length).toEqual(2);

        const request1 = postCalls[0][0];
        expect(request1.queryParams).toEqual({ project_id: 'projectId1' });
        expect(request1.postData).toEqual(
          expect.objectContaining({
            project_id: 'projectId1',
            metadata: expect.objectContaining({ project_id: 'projectId1' }),
          }),
        );

        const request2 = postCalls[1][0];
        expect(request2.queryParams).toEqual({ project_id: 'projectId2' });
        expect(request2.postData).toEqual(
          expect.objectContaining({
            project_id: 'projectId2',
            metadata: expect.objectContaining({ project_id: 'projectId2' }),
          }),
        );
      });
    });

    describe('saveSentEvent', () => {
      const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_connect_wallet`;
      const SENT_EVENT_LIST_KEY = `${SENT_EVENT_KEY}_all`;

      // Arrange
      const httpClientMock = {
        post: jest.fn().mockResolvedValue(null),
      };

      httpClientMock.post = jest.fn();
      const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

      it('should save the event in the localStorage array if the event is a connect_wallet', async () => {
        const fuulEvent: FuulEvent = {
          name: 'connect_wallet',
          user_address: '0x12345',
          args: {
            page: '/home',
          },
          metadata: {
            tracking_id: '123',
          },
        };

        // Act
        await es.sendEvent(fuulEvent);

        // Assert
        const savedEvent = localStorage.getItem(SENT_EVENT_LIST_KEY);
        expect(savedEvent).toEqual(
          JSON.stringify([
            {
              name: 'connect_wallet',
              user_address: '0x12345',
              tracking_id: '123',
              page: '/home',
            },
          ]),
        );
      });
      it('should not save the event in the localStorage array if the event is not a connect_wallet', async () => {
        const fuulEvent: FuulEvent = {
          name: 'some-event',
          user_address: '0x12345',
          args: {
            page: '/home',
          },
          metadata: {
            tracking_id: '123',
          },
        };

        // Act
        await es.sendEvent(fuulEvent);

        // Assert
        const savedEvent = localStorage.getItem(SENT_EVENT_LIST_KEY);
        expect(savedEvent).toBeNull();
      });
      it('should not save the event in the localStorage array if the event is a connect_wallet but some field is missing', async () => {
        const fuulEvent: FuulEvent = {
          name: 'connect_wallet',
          args: {
            page: '/home',
          },
          metadata: {
            tracking_id: '123',
          },
        };

        // Act
        await es.sendEvent(fuulEvent);

        // Assert
        const savedEvent = localStorage.getItem(SENT_EVENT_LIST_KEY);
        expect(savedEvent).toBeNull();
      });
      it('should replace last event in localStorage if there are more than 10 events', async () => {
        const existingEvents = Array.from({ length: 10 }, (_, i) => ({
          name: 'connect_wallet',
          user_address: `0x${i.toString().padStart(40, '0')}`,
          tracking_id: `tracking-${i}`,
          page: `/page-${i}`,
        }));
        localStorage.setItem(SENT_EVENT_LIST_KEY, JSON.stringify(existingEvents));

        const newEvent: FuulEvent = {
          name: 'connect_wallet',
          user_address: '0xNewAddress',
          args: {
            page: '/new-page',
          },
          metadata: {
            tracking_id: 'new-tracking-id',
          },
        };

        // Act
        await es.sendEvent(newEvent);

        // Assert
        const savedEvent = localStorage.getItem(SENT_EVENT_LIST_KEY);
        const parsedEvents = JSON.parse(savedEvent || '[]');

        expect(parsedEvents).toHaveLength(10);
        expect(parsedEvents[0]).toEqual({
          name: 'connect_wallet',
          user_address: '0x0000000000000000000000000000000000000001',
          tracking_id: 'tracking-1',
          page: '/page-1',
        });
        expect(parsedEvents[9]).toEqual({
          name: 'connect_wallet',
          user_address: '0xNewAddress',
          tracking_id: 'new-tracking-id',
          page: '/new-page',
        });
      });
    });
  });

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
