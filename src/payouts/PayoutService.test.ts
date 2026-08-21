import { HttpClient } from '../HttpClient';
import { ListReferralEarningsResponse, ReferralEarningsRow } from '../types/api';
import { UserIdentifierType } from '../types/user';
import { PayoutService } from './PayoutService';

// Cursors are opaque and base64-ish: '+', '/' and '=' must survive the round trip untouched.
const CURSOR = 'eyJ1IjoiMHhhYmMiLCJ0IjoiZXZtX2FkZHJlc3MifQ==+/';

const buildRow = (userIdentifier: string): ReferralEarningsRow => ({
  user_identifier: userIdentifier,
  user_identifier_type: UserIdentifierType.EvmAddress,
  volume: 12480.55,
  direct_eligible_volume: 12480.55,
  indirect_eligible_volume: 0,
  earnings: [{ currency: { address: '0x4200000000000000000000000000000000000006', chainId: '57073' }, amount: 62.4 }],
  total_commission_earned: [{ currency: { address: '0x4200000000000000000000000000000000000006', chainId: '57073' }, amount: 62.4 }],
  date_joined: '2025-01-14',
  user_rebate_rate: 0.2,
  referral_code: 'my-code',
});

describe('PayoutService', () => {
  describe('listReferralEarnings', () => {
    const baseParams = {
      user_identifier: '0x1d700814e4571e79274ad9c5a5ddf1acd960810f',
      user_identifier_type: UserIdentifierType.EvmAddress,
    };

    const buildService = (response: ListReferralEarningsResponse = { results: [], next_cursor: null, count: 0 }) => {
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({ data: response }),
      };
      const service = new PayoutService({ httpClient: httpClientMock as unknown as HttpClient });

      return { httpClientMock, service };
    };

    it('requests the referral-earnings path and forwards every param', async () => {
      const { httpClientMock, service } = buildService();

      await service.listReferralEarnings({
        ...baseParams,
        referrer_scope: 'all',
        limit: 1000,
        after: CURSOR,
        from_date: '2025-01-01',
        to_date: '2025-01-31',
      });

      expect(httpClientMock.get).toHaveBeenCalledWith({
        path: '/payouts/referral-earnings',
        queryParams: {
          user_identifier: baseParams.user_identifier,
          user_identifier_type: UserIdentifierType.EvmAddress,
          referrer_scope: 'all',
          limit: 1000,
          after: CURSOR,
          from_date: '2025-01-01',
          to_date: '2025-01-31',
        },
      });
    });

    it('leaves after undefined on the first page', async () => {
      const { httpClientMock, service } = buildService();

      await service.listReferralEarnings(baseParams);

      const { queryParams } = httpClientMock.get.mock.calls[0][0];
      expect(queryParams.after).toBeUndefined();
    });

    it('returns the envelope unchanged', async () => {
      const response: ListReferralEarningsResponse = {
        results: [buildRow('0x70b2ab9be62ce1a741ed166cbfc0555aec3b81b4')],
        next_cursor: CURSOR,
        count: 1,
      };
      const { service } = buildService(response);

      await expect(service.listReferralEarnings(baseParams)).resolves.toEqual(response);
    });

    it('forwards a cursor verbatim across a two-page walk', async () => {
      const httpClientMock = {
        get: jest
          .fn()
          .mockResolvedValueOnce({ data: { results: [buildRow('0xaaa')], next_cursor: CURSOR, count: 1 } })
          .mockResolvedValueOnce({ data: { results: [buildRow('0xbbb')], next_cursor: null, count: 1 } }),
      };
      const service = new PayoutService({ httpClient: httpClientMock as unknown as HttpClient });

      const rows: ReferralEarningsRow[] = [];
      let cursor: string | null = null;

      do {
        const page: ListReferralEarningsResponse = await service.listReferralEarnings({
          ...baseParams,
          limit: 1,
          ...(cursor ? { after: cursor } : {}),
        });

        rows.push(...page.results);
        cursor = page.next_cursor;
      } while (cursor);

      expect(httpClientMock.get).toHaveBeenCalledTimes(2);
      expect(httpClientMock.get.mock.calls[1][0].queryParams.after).toBe(CURSOR);
      expect(rows.map((row) => row.user_identifier)).toEqual(['0xaaa', '0xbbb']);
    });

    it('keeps walking when a full page still carries a cursor', async () => {
      // The server emits next_cursor whenever results.length === limit, so a full final page of rows
      // is followed by an empty page. Terminating on a short page would drop that last page's rows.
      const httpClientMock = {
        get: jest
          .fn()
          .mockResolvedValueOnce({ data: { results: [buildRow('0xaaa'), buildRow('0xbbb')], next_cursor: CURSOR, count: 2 } })
          .mockResolvedValueOnce({ data: { results: [], next_cursor: null, count: 0 } }),
      };
      const service = new PayoutService({ httpClient: httpClientMock as unknown as HttpClient });

      let cursor: string | null = null;
      let pages = 0;

      do {
        const page: ListReferralEarningsResponse = await service.listReferralEarnings({
          ...baseParams,
          limit: 2,
          ...(cursor ? { after: cursor } : {}),
        });

        pages += 1;
        cursor = page.next_cursor;
      } while (cursor);

      expect(pages).toBe(2);
      expect(httpClientMock.get).toHaveBeenCalledTimes(2);
    });
  });
});
