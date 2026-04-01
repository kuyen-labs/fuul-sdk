import { AffiliatePortalService } from './AffiliatePortalService';
import { HttpClient } from '../HttpClient';

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
