/**
 * @jest-environment jsdom
 */

import 'jest-localstorage-mock';

import Fuul from '../src';

jest.mock('../src/infrastructure/http/HttpClient');
jest.mock('../src/infrastructure/conversions/conversionService');

jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

describe('Core', () => {
  const apiKey = 'your-api-key';
  beforeEach(() => {
    localStorage.clear();
  });

  it('should throw an error if API key is missing', () => {
    expect(() => Fuul.init('')).toThrow();
  });

  it('should NOT throw an error if API key is present', () => {
    Fuul.init('some-api-key');

    expect(Fuul.isInitialized()).toBe(true);
  });
});
