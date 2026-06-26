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

  describe('getAffiliatePaidVolumesByLevel', () => {
    it('passes all query params', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliatePaidVolumesByLevel({
        user_identifier: '0x123',
        from: '2026-01-01',
        to: '2026-01-31',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/paid-volumes-by-level',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            from: '2026-01-01',
            to: '2026-01-31',
          }),
        }),
      );
    });

    it('passes this_month flag', async () => {
      const { service, httpClientMock } = createService();

      await service.getAffiliatePaidVolumesByLevel({
        user_identifier: '0x123',
        this_month: true,
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/paid-volumes-by-level',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            this_month: true,
          }),
        }),
      );
    });
  });

  describe('getQualifiedUserBonus', () => {
    it('passes all query params', async () => {
      const { service, httpClientMock } = createService();

      await service.getQualifiedUserBonus({
        user_identifier: '0x123',
        from: '2026-01-01',
        to: '2026-01-31',
        trigger_refs: 'ref-1,ref-2',
        claimable_date: '2026-02-15',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/qualified-user-bonus',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            from: '2026-01-01',
            to: '2026-01-31',
            trigger_refs: 'ref-1,ref-2',
            claimable_date: '2026-02-15',
          }),
        }),
      );
    });

    it('returns result.data', async () => {
      const { service, httpClientMock } = createService();
      const data = {
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        qualified_user_count: 5,
        bonus_usd: 500,
        rate_per_user: 100,
        note: 'computed',
      };
      httpClientMock.get.mockResolvedValueOnce({ data });

      const result = await service.getQualifiedUserBonus({
        user_identifier: '0x123',
        from: '2026-01-01',
        to: '2026-01-31',
        trigger_refs: 'ref-1',
      });

      expect(result).toBe(data);
    });
  });

  describe('getHighVolumeTakerBonus', () => {
    it('passes all query params', async () => {
      const { service, httpClientMock } = createService();

      await service.getHighVolumeTakerBonus({
        user_identifier: '0x123',
        trigger_refs: 'ref-1,ref-2',
        from: '2026-01-01',
        to: '2026-01-31',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/high-volume-taker-bonus',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            trigger_refs: 'ref-1,ref-2',
            from: '2026-01-01',
            to: '2026-01-31',
          }),
        }),
      );
    });

    it('passes this_month flag', async () => {
      const { service, httpClientMock } = createService();

      await service.getHighVolumeTakerBonus({
        user_identifier: '0x123',
        trigger_refs: 'ref-1',
        this_month: 'true',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/affiliate-portal/high-volume-taker-bonus',
          queryParams: expect.objectContaining({
            user_identifier: '0x123',
            trigger_refs: 'ref-1',
            this_month: 'true',
          }),
        }),
      );
    });

    it('returns result.data', async () => {
      const { service, httpClientMock } = createService();
      const data = {
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        aggregate_taker_volume: 60000000,
        bonus: '$16,000 USDT0',
        note: 'computed',
      };
      httpClientMock.get.mockResolvedValueOnce({ data });

      const result = await service.getHighVolumeTakerBonus({
        user_identifier: '0x123',
        trigger_refs: 'ref-1',
        this_month: 'true',
      });

      expect(result).toBe(data);
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
