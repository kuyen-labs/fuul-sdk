/**
 * @jest-environment jsdom
 */

import 'jest-localstorage-mock';

import Fuul from './index';

jest.mock('./infrastructure/http/HttpClient');
jest.mock('./infrastructure/conversions/conversionService');

jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

describe('Fuul Class', () => {
  const apiKey = 'your-api-key';
  let fuul: Fuul;

  beforeEach(() => {
    localStorage.clear();

    fuul = new Fuul(apiKey);
  });

  it('should throw an error if API key is missing', () => {
    expect(() => new Fuul('')).toThrow('Fuul API key is required');
  });

  it('should initialize with the correct settings', () => {
    const baseApiUrl = 'https://api.fuul.xyz/api/v1/';

    expect(fuul['apiKey']).toBe(apiKey);
    expect(fuul['BASE_API_URL']).toBe(baseApiUrl);
    expect(fuul['httpClient']).toBeDefined();
    expect(fuul['conversionService']).toBeDefined();
  });
});
