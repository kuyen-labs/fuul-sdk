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

describe('tracking', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    jest.clearAllMocks();
  });

  /**
   * @jest-environment jsdom
   * @jest-environment-options {"url": "https://jestjs.io/"}
   */
  describe('getTrafficSource()', () => {
    [
      'https://www.google.com',
      'https://www.bing.com',
      'https://www.google.com/bka/lba?dsad',
      'https://www.yahoo.com/dsa/cas',
    ].forEach((testReferrer) => {
      it(`should return organic: ${testReferrer}`, () => {
        // Arrange
        jest.spyOn(document, 'referrer', 'get').mockReturnValue(testReferrer);
        jest.spyOn(tracking, 'getQueryParam').mockReturnValue(null);

        // Act
        const detectedSource = tracking.getTrafficSource();

        // Assert
        expect(detectedSource).toBe('organic');
      });
    });

    it(`should return value of 'source'`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.google.com/');
      jest.spyOn(tracking, 'getQueryParam').mockImplementation((key: string): string | null => {
        if (key == 'af') {
          return '0x1234';
        }

        if (key == 'source') {
          return 'some-source';
        }
        return null;
      });

      // Act
      const detectedSource = tracking.getTrafficSource();

      // Assert
      expect(detectedSource).toBe('some-source');
    });

    it(`should return affiliate`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.google.com/');
      jest.spyOn(tracking, 'getQueryParam').mockImplementation((key: string): string | null => {
        if (key == 'af') {
          return '0x1234';
        }
        return null;
      });

      // Act
      const detectedSource = tracking.getTrafficSource();

      // Assert
      expect(detectedSource).toBe('affiliate');
    });

    it(`should return affiliate`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.google.com/');
      jest.spyOn(tracking, 'getQueryParam').mockImplementation((key: string): string | null => {
        if (key == 'af') {
          return '0x1234';
        }
        return null;
      });

      // Act
      const detectedSource = tracking.getTrafficSource();

      // Assert
      expect(detectedSource).toBe('affiliate');
    });

    it(`should return direct`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.sarasa.com/');
      jest.spyOn(tracking, 'getQueryParam').mockImplementation((key: string): string | null => {
        return null;
      });

      // Act
      const detectedSource = tracking.getTrafficSource();

      // Assert
      expect(detectedSource).toBe('direct');
    });
  });
});
