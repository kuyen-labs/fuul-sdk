import { HttpClient } from '../HttpClient';
import { UserIdentifierType } from '../types/user';
import { ClaimCheckService } from './ClaimCheckService';
import { ClaimCheckTotalsReasonFilter, ClaimCheckTotalsStatusFilter } from './types';

describe('ClaimCheckService', () => {
  describe('getClaimCheckTotals', () => {
    const baseParams = {
      user_identifier: '0x123',
      user_identifier_type: UserIdentifierType.EvmAddress,
    };

    const buildService = () => {
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({ data: { claimed: [], unclaimed: [] } }),
      };
      const service = new ClaimCheckService({ httpClient: httpClientMock as unknown as HttpClient });

      return { httpClientMock, service };
    };

    it('forwards the reason filter as a query param', async () => {
      const { httpClientMock, service } = buildService();

      await service.getClaimCheckTotals({ ...baseParams, reason: ClaimCheckTotalsReasonFilter.EndUserPayout });

      expect(httpClientMock.get).toHaveBeenCalledWith({
        path: '/claim-checks/totals',
        queryParams: {
          user_identifier: '0x123',
          user_identifier_type: UserIdentifierType.EvmAddress,
          reason: 'end_user_payout',
        },
      });
    });

    it('omits reason entirely when not supplied', async () => {
      const { httpClientMock, service } = buildService();

      await service.getClaimCheckTotals(baseParams);

      const { queryParams } = httpClientMock.get.mock.calls[0][0];
      expect(Object.keys(queryParams)).not.toContain('reason');
    });

    it('forwards status and reason together', async () => {
      const { httpClientMock, service } = buildService();

      await service.getClaimCheckTotals({
        ...baseParams,
        status: ClaimCheckTotalsStatusFilter.Closed,
        reason: ClaimCheckTotalsReasonFilter.AffiliatePayout,
      });

      expect(httpClientMock.get).toHaveBeenCalledWith({
        path: '/claim-checks/totals',
        queryParams: {
          user_identifier: '0x123',
          user_identifier_type: UserIdentifierType.EvmAddress,
          status: 'closed',
          reason: 'affiliate_payout',
        },
      });
    });
  });
});
