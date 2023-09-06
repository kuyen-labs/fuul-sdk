/**
 * @jest-environment jsdom
 */

import 'jest-localstorage-mock';

import { Fuul } from './index';

jest.mock('./HttpClient');
jest.mock('./ConversionService');

jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

describe('Fuul Class', () => {
  const apiKey = 'your-api-key';

  beforeEach(() => {
    localStorage.clear();
  });

  it.skip('should throw an error if API key is missing', () => {
    expect(() => Fuul.init({ apiKey: '' })).toThrow('Fuul API key is required');
  });
});
