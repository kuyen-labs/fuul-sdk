import { HttpClient } from '../HttpClient';
import { UserIdentifierType } from '../types/user';
import { ClaimCheckService } from './ClaimCheckService';

jest.mock('../HttpClient');

describe('ClaimCheckService', () => {
  let service: ClaimCheckService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = new HttpClient({
      baseURL: 'https://api.test.xyz',
      timeout: 30000,
      apiKey: 'test-key',
    }) as jest.Mocked<HttpClient>;

    service = new ClaimCheckService({
      httpClient: mockHttpClient,
      debug: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimableChecks', () => {
    it('should call post with correct parameters', async () => {
      const mockResponse = {
        data: [
          {
            project_address: '0xproject',
            to: '0x123',
            currency: '0xtoken',
            currency_type: 1,
            amount: '1000000000000000000',
            reason: 0,
            token_id: '0',
            deadline: 1704067200,
            proof: '0xproof',
            signatures: ['0xsig1', '0xsig2'],
          },
        ],
      };
      mockHttpClient.post.mockResolvedValue(mockResponse as any);

      await service.getClaimableChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith({
        path: '/claim-checks/claim',
        postData: {
          userIdentifier: '0x123',
          userIdentifierType: UserIdentifierType.EvmAddress,
        },
      });
    });

    it('should return parsed response data', async () => {
      const mockResponse = {
        data: [
          {
            project_address: '0xproject',
            to: '0x123',
            currency: '0xtoken',
            currency_type: 1,
            amount: '1000000000000000000',
            reason: 0,
            token_id: '0',
            deadline: 1704067200,
            proof: '0xproof',
            signatures: ['0xsig1'],
          },
        ],
      };
      mockHttpClient.post.mockResolvedValue(mockResponse as any);

      const result = await service.getClaimableChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result).toEqual(mockResponse.data);
      expect(result.length).toBe(1);
      expect(result[0].amount).toBe('1000000000000000000');
    });

    it('should return empty array when no claims available', async () => {
      const mockResponse = {
        data: [],
      };
      mockHttpClient.post.mockResolvedValue(mockResponse as any);

      const result = await service.getClaimableChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result).toEqual([]);
    });

    it('should handle different identifier types', async () => {
      const mockResponse = {
        data: [],
      };
      mockHttpClient.post.mockResolvedValue(mockResponse as any);

      await service.getClaimableChecks({
        user_identifier: 'user@example.com',
        user_identifier_type: UserIdentifierType.Email,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith({
        path: '/claim-checks/claim',
        postData: {
          userIdentifier: 'user@example.com',
          userIdentifierType: UserIdentifierType.Email,
        },
      });
    });
  });

  describe('getClaimCheckTotals', () => {
    it('should call get with correct query parameters', async () => {
      const mockResponse = {
        data: {
          claimed: [],
          unclaimed: [],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse as any);

      await service.getClaimCheckTotals({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith({
        path: '/claim-checks/totals',
        queryParams: {
          user_identifier: '0x123',
          user_identifier_type: UserIdentifierType.EvmAddress,
        },
      });
    });

    it('should return parsed totals response', async () => {
      const mockResponse = {
        data: {
          claimed: [
            {
              currency_address: '0xtoken1',
              currency_chain_id: '1',
              currency_name: 'USDC',
              currency_decimals: 6,
              amount: '1000000',
            },
          ],
          unclaimed: [
            {
              currency_address: '0xtoken2',
              currency_chain_id: '1',
              currency_name: 'USDT',
              currency_decimals: 6,
              amount: '2000000',
            },
          ],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse as any);

      const result = await service.getClaimCheckTotals({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result).toEqual(mockResponse.data);
      expect(result.claimed.length).toBe(1);
      expect(result.unclaimed.length).toBe(1);
      expect(result.claimed[0].currency_name).toBe('USDC');
      expect(result.unclaimed[0].amount).toBe('2000000');
    });

    it('should handle empty totals', async () => {
      const mockResponse = {
        data: {
          claimed: [],
          unclaimed: [],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse as any);

      const result = await service.getClaimCheckTotals({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result.claimed).toEqual([]);
      expect(result.unclaimed).toEqual([]);
    });

    it('should handle different identifier types', async () => {
      const mockResponse = {
        data: {
          claimed: [],
          unclaimed: [],
        },
      };
      mockHttpClient.get.mockResolvedValue(mockResponse as any);

      await service.getClaimCheckTotals({
        user_identifier: 'SolanaAddress123',
        user_identifier_type: UserIdentifierType.SolanaAddress,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith({
        path: '/claim-checks/totals',
        queryParams: {
          user_identifier: 'SolanaAddress123',
          user_identifier_type: UserIdentifierType.SolanaAddress,
        },
      });
    });
  });
});
