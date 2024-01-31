/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://fuul.test.xyz/test-page"}
 */

import 'jest-localstorage-mock';

import * as queryParams from './query-params';

jest.mock('../modules/events/infra/service');
jest.mock('../modules/http/client');
jest.mock('../modules/conversions/infra/service');

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
    it(`should return the source query param when it is present`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.google.com/');
      jest.spyOn(queryParams, 'getQueryParam').mockImplementation((key: string): string | null => {
        if (key === 'source') {
          return 'some-source';
        }

        return null;
      });

      // Act
      const detectedSource = queryParams.getTrafficSource();

      // Assert
      expect(detectedSource).toBe('some-source');
    });

    it(`should return undefined when the source query param is not present`, () => {
      // Arrange
      jest.spyOn(document, 'referrer', 'get').mockReturnValue('http://www.google.com/');
      jest.spyOn(queryParams, 'getQueryParam').mockImplementation((key: string): string | null => {
        if (key === 'source') {
          return null;
        }

        throw new Error(`Unexpected key: ${key}`);
      });

      // Act
      const detectedSource = queryParams.getTrafficSource();

      // Assert
      expect(detectedSource).toBeUndefined();
    });
  });
});
