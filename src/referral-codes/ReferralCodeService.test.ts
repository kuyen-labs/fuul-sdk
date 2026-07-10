import { AxiosError } from 'axios';

import { ValidationError } from '../affiliates/errors';
import { HttpClient } from '../HttpClient';
import { UserIdentifierType } from '../types/user';
import { ReferralCodeService } from './ReferralCodeService';

describe('ReferralCodeService', () => {
  describe('useReferralCode', () => {
    const baseParams = {
      code: 'ABC123',
      user_identifier: '0x123',
      user_identifier_type: UserIdentifierType.EvmAddress,
      signature: 'signature',
      signature_message: 'message',
    };

    it('returns data on a successful response', async () => {
      const httpClientMock = {
        patch: jest.fn().mockResolvedValue({ data: undefined }),
      };
      const service = new ReferralCodeService({ httpClient: httpClientMock as unknown as HttpClient });

      await expect(service.useReferralCode(baseParams)).resolves.toBeUndefined();
      expect(httpClientMock.patch).toHaveBeenCalledTimes(1);
    });

    it('throws the real API message instead of the generic Axios message on a 422', async () => {
      const axiosError = new AxiosError('Request failed with status code 422', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 422,
        data: { message: 'User already has a referrer', statusCode: 422 },
      } as any);

      const httpClientMock = {
        patch: jest.fn().mockRejectedValue(axiosError),
      };
      const service = new ReferralCodeService({ httpClient: httpClientMock as unknown as HttpClient });

      await expect(service.useReferralCode(baseParams)).rejects.toThrow('User already has a referrer');
    });

    it('throws a ValidationError when the API returns an array of messages', async () => {
      const axiosError = new AxiosError('Request failed with status code 422', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 422,
        data: { message: ['user_identifier must be a valid address', 'signature is required'], statusCode: 422 },
      } as any);

      const httpClientMock = {
        patch: jest.fn().mockRejectedValue(axiosError),
      };
      const service = new ReferralCodeService({ httpClient: httpClientMock as unknown as HttpClient });

      await expect(service.useReferralCode(baseParams)).rejects.toBeInstanceOf(ValidationError);
      await expect(service.useReferralCode(baseParams)).rejects.toThrow('user_identifier must be a valid address, signature is required');
    });

    it('rethrows the original error when it is not an AxiosError', async () => {
      const originalError = new Error('network down');

      const httpClientMock = {
        patch: jest.fn().mockRejectedValue(originalError),
      };
      const service = new ReferralCodeService({ httpClient: httpClientMock as unknown as HttpClient });

      await expect(service.useReferralCode(baseParams)).rejects.toBe(originalError);
    });

    it('rethrows the original AxiosError when the response has no message', async () => {
      const axiosError = new AxiosError('Request failed with status code 500', 'ERR_BAD_RESPONSE', undefined, undefined, {
        status: 500,
        data: {},
      } as any);

      const httpClientMock = {
        patch: jest.fn().mockRejectedValue(axiosError),
      };
      const service = new ReferralCodeService({ httpClient: httpClientMock as unknown as HttpClient });

      await expect(service.useReferralCode(baseParams)).rejects.toBe(axiosError);
    });
  });
});
