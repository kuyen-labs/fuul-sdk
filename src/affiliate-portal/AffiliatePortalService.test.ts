import { HttpClient } from '../HttpClient';
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

    it('still passes deprecated conversion_id for backward compatibility', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliateStats({
        user_identifier: '0x123',
        conversion_id: 'some-uuid',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          queryParams: expect.objectContaining({
            conversion_id: 'some-uuid',
          }),
        }),
      );
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
  });
});
