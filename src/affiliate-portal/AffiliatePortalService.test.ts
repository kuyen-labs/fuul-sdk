import { HttpClient } from '../HttpClient';
import { UserIdentifierType } from '../types/user';
import { AffiliatePortalService } from './AffiliatePortalService';

describe('AffiliatePortalService', () => {
  const createService = () => {
    const httpClientMock = {
      get: jest.fn().mockResolvedValue({ data: {} }),
    };
    const service = new AffiliatePortalService({
      httpClient: httpClientMock as unknown as HttpClient,
    });
    return { service, httpClientMock };
  };

  describe('getReferralTree', () => {
    it('passes user_identifier as query param', async () => {
      const { service, httpClientMock } = createService();

      await service.getReferralTree({
        user_identifier: '0x123',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/referral-tree',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
          }),
        }),
      );
    });
  });

  describe('getStatsBreakdown', () => {
    it('passes all query params', async () => {
      const { service, httpClientMock } = createService();

      await service.getStatsBreakdown({
        user_identifier: '0x123',
        group_by: 'month',
        date_range: '30d',
        currency_id: 'some-uuid',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/stats-breakdown',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            group_by: 'month',
            date_range: '30d',
            currency_id: 'some-uuid',
          }),
        }),
      );
    });
  });

  describe('getAffiliateStats', () => {
    it('passes conversion_external_id as query param', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliateStats({
        user_identifier: '0x123',
        conversion_external_id: 1,
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/stats',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            conversion_external_id: 1,
          }),
        }),
      );
    });

    it('does not forward the deprecated conversion_id even when callers pass it', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliateStats({
        user_identifier: '0x123',
        conversion_id: 'some-uuid',
      });

      const [callArg] = httpClientMock.get.mock.calls[0];
      expect(callArg.queryParams).not.toHaveProperty('conversion_id');
    });

    it('passes conversion_name as query param', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliateStats({
        user_identifier: '0x123',
        conversion_name: 'my-conversion',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({
            conversion_name: 'my-conversion',
          }),
        }),
      );
    });

    it('only forwards server-supported params, even when deprecated fields are passed', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliateStats({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        from: '2026-01-01',
        to: '2026-01-31',
        this_month: true,
        conversion_id: 'some-uuid',
        conversion_external_id: 42,
        conversion_name: 'my-conversion',
      });

      const [callArg] = httpClientMock.get.mock.calls[0];
      expect(Object.keys(callArg.queryParams).sort()).toEqual(
        ['conversion_external_id', 'conversion_name', 'from', 'this_month', 'to', 'user_identifier'].sort(),
      );
    });
  });
});
