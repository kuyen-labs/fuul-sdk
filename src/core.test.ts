/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://fuul.test.xyz/test-page"}
 */

import 'jest-localstorage-mock';

import * as tracking from './tracking';
import { EventService } from './EventService';
jest.mock('./EventService');

import { Fuul } from './index';

jest.mock('./EventService');
jest.mock('./HttpClient');
jest.mock('./ConversionService');

jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

describe('SDK core', () => {
  const testApiKey = 'your-api-key';

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('init()', () => {
    it('should throw when an invalid API key is provided', () => {
      expect(() => Fuul.init({ apiKey: '' })).toThrow();
    });

    it('should throw when un-initialized', async () => {
      await expect(() => Fuul.sendPageview()).rejects.toThrow();
    });
  });

  /**
   * @jest-environment jsdom
   * @jest-environment-options {"url": "https://jestjs.io/"}
   */
  describe('sendEvent()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call sendEvent with populated tracking properties', () => {
      // Arrange
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');
      jest.spyOn(tracking, 'getAffiliateId').mockReturnValue('some-affiliate-id');
      jest.spyOn(tracking, 'getReferrerUrl').mockReturnValue('some-referrer-url');
      jest.spyOn(tracking, 'getTrafficSource').mockReturnValue('some-traffic-source');
      jest.spyOn(tracking, 'getTrafficCategory').mockReturnValue('some-traffic-category');
      jest.spyOn(tracking, 'getTrafficTitle').mockReturnValue('some-traffic-title');
      jest.spyOn(tracking, 'getTrafficTag').mockReturnValue('some-traffic-tag');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendEvent('sarlanga');

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('sarlanga');
      expect(createdEvent.args).toStrictEqual({});

      const eventMetadata = createdEvent.metadata;
      expect(eventMetadata.tracking_id).toBe('some-tracking-id');
      expect(eventMetadata.affiliate_id).toBe('some-affiliate-id');
      expect(eventMetadata.referrer).toBe('some-affiliate-id');
      expect(eventMetadata.source).toBe('some-traffic-source');
      expect(eventMetadata.category).toBe('some-traffic-category');
      expect(eventMetadata.title).toBe('some-traffic-title');
      expect(eventMetadata.referrer_url).toBe('some-referrer-url');
      expect(eventMetadata.tag).toBe('some-traffic-tag');
    });
  });

  describe('sendPageview()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with no arguments should call sendEvent with correct arguments', () => {
      // Arrange
      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendPageview();

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/test-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
    });

    it('with page arguments should call sendEvent with correct arguments', () => {
      // Arrange
      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendPageview('/custom-page');

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/custom-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
    });
  });

  describe('sendConnectWallet()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with required arguments should call sendEvent with correct arguments', () => {
      // Arrange
      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendConnectWallet({
        address: 'some-address',
      });

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.user_address).toBe('some-address');
      expect(createdEvent.signature).toBeUndefined();
      expect(createdEvent.signature_message).toBeUndefined();
    });

    it('with signature arguments should call sendEvent with correct arguments', () => {
      // Arrange
      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendConnectWallet({
        address: 'some-address',
        signature: 'some-signature',
        message: 'some-message',
      });

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.user_address).toBe('some-address');
      expect(createdEvent.signature).toBe('some-signature');
      expect(createdEvent.signature_message).toBe('some-message');
    });
  });
});
