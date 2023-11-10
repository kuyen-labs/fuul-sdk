/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://fuul.test.xyz/test-page"}
 */

import 'jest-localstorage-mock';

import { EventService } from './EventService';
import * as tracking from './tracking';
jest.mock('./EventService');

import { Fuul } from './index';

jest.mock('./EventService');
jest.mock('./HttpClient');
jest.mock('./ConversionService');

jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

describe('SDK core', () => {
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

    it('should call sendEvent with correct argument', () => {
      // Arrange
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendEvent('sarlanga', { test: 'some-test-arg' });

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('sarlanga');
      expect(createdEvent.args).toStrictEqual({ test: 'some-test-arg' });
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
    });
  });

  describe('sendPageview()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with no arguments should call sendEvent with correct arguments', () => {
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
      Fuul.sendPageview();

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      const eventMetadata = createdEvent.metadata;

      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/test-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
      expect(createdEvent.metadata).toStrictEqual({
        tracking_id: 'some-tracking-id',
        referrer: 'some-affiliate-id',
        affiliate_id: 'some-affiliate-id',
        source: 'some-traffic-source',
        category: 'some-traffic-category',
        title: 'some-traffic-title',
        referrer_url: 'some-referrer-url',
        tag: 'some-traffic-tag',
      });
    });

    it('with page arguments should call sendEvent with correct arguments', () => {
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
      Fuul.sendPageview('/custom-page');

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/custom-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
      expect(createdEvent.metadata).toStrictEqual({
        tracking_id: 'some-tracking-id',
        affiliate_id: 'some-affiliate-id',
        referrer: 'some-affiliate-id',
        source: 'some-traffic-source',
        category: 'some-traffic-category',
        title: 'some-traffic-title',
        referrer_url: 'some-referrer-url',
        tag: 'some-traffic-tag',
      });
    });
  });

  describe('sendConnectWallet()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with required arguments should call sendEvent with correct arguments', () => {
      // Arrange
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      // Act
      Fuul.sendConnectWallet({
        address: 'some-address',
      });

      // Assert
      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.args).toStrictEqual({});
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
      expect(createdEvent.user_address).toBe('some-address');
      expect(createdEvent.signature).toBeUndefined();
      expect(createdEvent.signature_message).toBeUndefined();
    });

    it('with signature arguments should call sendEvent with correct arguments', () => {
      // Arrange
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

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
      expect(createdEvent.args).toStrictEqual({});
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
      expect(createdEvent.user_address).toBe('some-address');
      expect(createdEvent.signature).toBe('some-signature');
      expect(createdEvent.signature_message).toBe('some-message');
    });
  });

  describe('generateTrackingLink()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('generates basic tracking link', async () => {
      // Act
      const generatedLink = await Fuul.generateTrackingLink('https://www.google.com', '0x124');

      // Assert
      expect(generatedLink).toBe('https://www.google.com?af=0x124');
    });

    it('generates link with tracking params', async () => {
      // Act
      const generatedLink = await Fuul.generateTrackingLink('https://www.google.com', '0x124', {
        title: 'test-title',
        format: 'banner',
        place: 'upper-banner',
      });

      // Assert
      expect(generatedLink).toBe(
        'https://www.google.com?af=0x124&af_title=test-title&af_format=banner&af_place=upper-banner',
      );
    });
  });
});
