/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://fuul.test.xyz/test-page"}
 */

import 'jest-localstorage-mock';

import { AffiliateService } from './affiliates/AffiliateService';
import { ClaimCheckService } from './claim-checks/ClaimCheckService';
import { EventService } from './EventService';
import * as tracking from './tracking';

jest.mock('./EventService');
jest.mock('./affiliates/AffiliateService');
jest.mock('./ConversionService');
jest.mock('nanoid', () => ({
  nanoid: () => '123',
}));

import { Fuul, UserIdentifierType } from './index';
import { LeaderboardService } from './leaderboard/LeaderboardService';
import { PayoutService } from './payouts/PayoutService';

describe('SDK core', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('init()', () => {
    it('should throw when an invalid API key is provided', () => {
      expect(() => Fuul.init({ apiKey: '' })).toThrow();
    });

    it('should throw when un-initialized', async () => {
      await expect(() => Fuul.sendPageview()).rejects.toThrow();
    });
  });

  /**
   * @jest-environment jsdom
   * @jest-environment-options {"url": "https://jestjs.io/"}
   */
  describe('sendEvent()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call sendEvent with correct argument', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.sendEvent('sarlanga', { test: 'some-test-arg' });

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('sarlanga');
      expect(createdEvent.args).toStrictEqual({ test: 'some-test-arg' });
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
    });
  });

  describe('sendPageview()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with no arguments should call sendEvent with correct arguments', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');
      jest.spyOn(tracking, 'getAffiliateId').mockReturnValue('some-affiliate-id');
      jest.spyOn(tracking, 'getReferrerUrl').mockReturnValue('some-referrer-url');
      jest.spyOn(tracking, 'getTrafficSource').mockReturnValue('some-traffic-source');
      jest.spyOn(tracking, 'getTrafficCategory').mockReturnValue('some-traffic-category');
      jest.spyOn(tracking, 'getTrafficTitle').mockReturnValue('some-traffic-title');
      jest.spyOn(tracking, 'getTrafficTag').mockReturnValue('some-traffic-tag');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.sendPageview();

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/test-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
      expect(createdEvent.metadata).toStrictEqual({
        tracking_id: 'some-tracking-id',
        referrer: 'some-affiliate-id',
        affiliate_id: 'some-affiliate-id',
        source: 'some-traffic-source',
        category: 'some-traffic-category',
        title: 'some-traffic-title',
        referrer_url: 'some-referrer-url',
        tag: 'some-traffic-tag',
      });
    });

    it('with page arguments should call sendEvent with correct arguments', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');
      jest.spyOn(tracking, 'getAffiliateId').mockReturnValue('some-affiliate-id');
      jest.spyOn(tracking, 'getReferrerUrl').mockReturnValue('some-referrer-url');
      jest.spyOn(tracking, 'getTrafficSource').mockReturnValue('some-traffic-source');
      jest.spyOn(tracking, 'getTrafficCategory').mockReturnValue('some-traffic-category');
      jest.spyOn(tracking, 'getTrafficTitle').mockReturnValue('some-traffic-title');
      jest.spyOn(tracking, 'getTrafficTag').mockReturnValue('some-traffic-tag');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.sendPageview('/custom-page');

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('pageview');
      expect(createdEvent.args).toStrictEqual({
        page: '/custom-page',
        locationOrigin: 'https://fuul.test.xyz',
      });
      expect(createdEvent.metadata).toStrictEqual({
        tracking_id: 'some-tracking-id',
        affiliate_id: 'some-affiliate-id',
        referrer: 'some-affiliate-id',
        source: 'some-traffic-source',
        category: 'some-traffic-category',
        title: 'some-traffic-title',
        referrer_url: 'some-referrer-url',
        tag: 'some-traffic-tag',
      });
    });
  });

  describe('identifyUser()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('with required arguments should call sendEvent with correct arguments', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.identifyUser({
        identifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
      });

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.args).toStrictEqual({
        locationOrigin: 'https://fuul.test.xyz',
        page: '/test-page',
      });
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
      expect(createdEvent.user?.identifier).toBe('0x123');
      expect(createdEvent.user?.identifier_type).toBe(UserIdentifierType.EvmAddress);
      expect(createdEvent.signature).toBeUndefined();
      expect(createdEvent.signature_message).toBeUndefined();
    });

    it('with signature arguments should call sendEvent with correct arguments', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.identifyUser({
        identifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
        signature: 'some-signature',
        message: 'some-message',
      });

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.user?.identifier).toBe('0x123');
      expect(createdEvent.user?.identifier_type).toBe(UserIdentifierType.EvmAddress);
      expect(createdEvent.args).toStrictEqual({
        locationOrigin: 'https://fuul.test.xyz',
        page: '/test-page',
      });
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
      expect(createdEvent.signature).toBe('some-signature');
      expect(createdEvent.signature_message).toBe('some-message');
    });

    it('with signature public key should include signature_public_key in event', () => {
      jest.spyOn(tracking, 'getTrackingId').mockReturnValue('some-tracking-id');

      const eventServiceMock = EventService as jest.MockedClass<typeof EventService>;

      Fuul.identifyUser({
        identifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
        signature: 'some-signature',
        message: 'some-message',
        signaturePublicKey: 'some-public-key',
      });

      const createdEvent = eventServiceMock.prototype.sendEvent.mock.calls[0][0];
      expect(createdEvent.name).toBe('connect_wallet');
      expect(createdEvent.user?.identifier).toBe('0x123');
      expect(createdEvent.user?.identifier_type).toBe(UserIdentifierType.EvmAddress);
      expect(createdEvent.args).toStrictEqual({
        locationOrigin: 'https://fuul.test.xyz',
        page: '/test-page',
      });
      expect(createdEvent.metadata).toStrictEqual({ tracking_id: 'some-tracking-id' });
      expect(createdEvent.signature).toBe('some-signature');
      expect(createdEvent.signature_message).toBe('some-message');
      expect(createdEvent.signature_public_key).toBe('some-public-key');
    });
  });

  describe('generateTrackingLink()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('generates basic tracking link', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.getReferral.mockImplementation(async () => {
        return null;
      });

      const generatedLink = await Fuul.generateTrackingLink('https://www.google.com', '0x124', UserIdentifierType.EvmAddress);

      expect(generatedLink).toBe('https://www.google.com?af=0x124');
    });

    it('generates link with tracking params', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.getReferral.mockImplementation(async () => {
        return null;
      });

      const generatedLink = await Fuul.generateTrackingLink('https://www.google.com', '0x124', UserIdentifierType.EvmAddress, {
        title: 'test-title',
        format: 'banner',
        place: 'upper-banner',
      });

      expect(generatedLink).toBe('https://www.google.com?af=0x124&af_title=test-title&af_format=banner&af_place=upper-banner');
    });

    it('generates link with affiliate code', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.getReferral.mockImplementation(async () => {
        return {
          id: '123',
          name: 'test',
          code: 'my-affiliate-code',
          user_identifier: '0x124',
          user_identifier_type: 'evm_address',
          updated_at: '2024-01-01',
          created_at: '2024-01-01',
          uses: 0,
          clicks: 0,
          total_users: 0,
          total_earnings: 0,
          rebate_rate: null,
          region: 'Other',
          current_tier: null,
          codes: [
            {
              code: 'my-affiliate-code',
              created_at: '2024-01-01',
              uses: 0,
              clicks: 0,
              total_users: 0,
              total_earnings: 0,
              rebate_rate: null,
              current_tier: null,
            },
          ],
        };
      });

      const generatedLink = await Fuul.generateTrackingLink('https://www.google.com', '0x124', UserIdentifierType.EvmAddress, {
        title: 'test-title',
        format: 'banner',
        place: 'upper-banner',
      });

      expect(generatedLink).toBe('https://www.google.com?af=my-affiliate-code&af_title=test-title&af_format=banner&af_place=upper-banner');
    });
  });

  describe('getUserPayoutsByConversion()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call getUserPayoutsByConversion with correct arguments', async () => {
      const getUserPayoutsByConversionSpy = jest.spyOn(PayoutService.prototype, 'getUserPayoutsByConversion').mockResolvedValueOnce({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [
          {
            is_referrer: true,
            total_amount: '100',
            conversion_id: 'conversion-1',
            conversion_name: 'buy',
            currency_address: '0x1',
            chain_id: '1',
          },
        ],
      });

      const payouts = await Fuul.getUserPayoutsByConversion({
        user_identifier: '0x123',
        identifier_type: UserIdentifierType.EvmAddress,
        from: '2024-01-01',
        to: '2024-01-02',
      });

      expect(getUserPayoutsByConversionSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        identifier_type: UserIdentifierType.EvmAddress,
        from: '2024-01-01',
        to: '2024-01-02',
      });

      expect(payouts).toEqual({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [
          {
            is_referrer: true,
            total_amount: '100',
            conversion_id: 'conversion-1',
            conversion_name: 'buy',
            currency_address: '0x1',
            chain_id: '1',
          },
        ],
      });
    });
  });

  describe('getUserPointsByConversion()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call getUserPointsByConversion with correct arguments', async () => {
      const getUserPointsByConversionSpy = jest.spyOn(PayoutService.prototype, 'getUserPointsByConversion').mockResolvedValueOnce({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [
          {
            is_referrer: true,
            total_amount: '100',
            conversion_id: 'conversion-1',
            conversion_name: 'buy',
          },
        ],
      });

      const payouts = await Fuul.getUserPointsByConversion({
        user_identifier: '0x123',
        identifier_type: UserIdentifierType.EvmAddress,
        from: '2024-01-01',
        to: '2024-01-02',
      });

      expect(getUserPointsByConversionSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        identifier_type: UserIdentifierType.EvmAddress,
        from: '2024-01-01',
        to: '2024-01-02',
      });

      expect(payouts).toEqual({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [
          {
            is_referrer: true,
            total_amount: '100',
            conversion_id: 'conversion-1',
            conversion_name: 'buy',
          },
        ],
      });
    });
  });

  describe('getPayoutsLeaderboard()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call getPayoutsLeaderboard with correct arguments', async () => {
      const getPayoutsLeaderboardSpy = jest.spyOn(LeaderboardService.prototype, 'getPayoutsLeaderboard').mockResolvedValueOnce({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [],
        calculated_at: '2024-01-01T00:00:00Z',
      });

      const payouts = await Fuul.getPayoutsLeaderboard({
        currency_address: '0x123',
        user_type: 'affiliate',
      });

      expect(getPayoutsLeaderboardSpy).toHaveBeenCalledWith({
        currency_address: '0x123',
        user_type: 'affiliate',
      });

      expect(payouts).toEqual({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [],
        calculated_at: '2024-01-01T00:00:00Z',
      });
    });
  });

  describe('getPointsLeaderboard()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call getPointsLeaderboard with correct arguments', async () => {
      const getPointsLeaderboardSpy = jest.spyOn(LeaderboardService.prototype, 'getPointsLeaderboard').mockResolvedValueOnce({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [],
        calculated_at: '2024-01-01T00:00:00Z',
      });

      const payouts = await Fuul.getPointsLeaderboard({
        fields: 'rank',
      });

      expect(getPointsLeaderboardSpy).toHaveBeenCalledWith({
        fields: 'rank',
      });

      expect(payouts).toEqual({
        page: 1,
        page_size: 10,
        total_results: 100,
        results: [],
        calculated_at: '2024-01-01T00:00:00Z',
      });
    });
  });

  describe('getReferredUsersLeaderboard()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call getReferredUsersLeaderboard with correct arguments', async () => {
      const getReferredUsersLeaderboardSpy = jest.spyOn(LeaderboardService.prototype, 'getReferredUsersLeaderboard').mockResolvedValueOnce({
        page: 1,
        page_size: 10,
        total_results: 100,
        calculated_at: '2024-01-01T00:00:00Z',
        results: [
          {
            address: '0x123',
            rank: 1,
            total_referred_users: 10,
          },
          {
            address: '0x124',
            rank: 2,
            total_referred_users: 9,
          },
        ],
      });

      const payouts = await Fuul.getReferredUsersLeaderboard({
        page: 1,
        page_size: 10,
      });

      expect(getReferredUsersLeaderboardSpy).toHaveBeenCalledWith({
        page: 1,
        page_size: 10,
      });

      expect(payouts).toEqual({
        page: 1,
        page_size: 10,
        total_results: 100,
        calculated_at: '2024-01-01T00:00:00Z',
        results: [
          {
            address: '0x123',
            rank: 1,
            total_referred_users: 10,
          },
          {
            address: '0x124',
            rank: 2,
            total_referred_users: 9,
          },
        ],
      });
    });
  });

  describe('getClaimableChecks()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-api-key' });
    });

    it('should return claimable checks', async () => {
      const getClaimableChecksSpy = jest.spyOn(ClaimCheckService.prototype, 'getClaimableChecks').mockResolvedValue([
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
      ]);

      const checks = await Fuul.getClaimableChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(getClaimableChecksSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(checks).toEqual([
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
      ]);
    });

    it('should handle empty results', async () => {
      jest.spyOn(ClaimCheckService.prototype, 'getClaimableChecks').mockResolvedValue([]);

      const checks = await Fuul.getClaimableChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(checks).toEqual([]);
    });

    it('should work with email identifier', async () => {
      jest.spyOn(ClaimCheckService.prototype, 'getClaimableChecks').mockResolvedValue([
        {
          project_address: '0xproject',
          to: 'user@example.com',
          currency: '0xtoken',
          currency_type: 1,
          amount: '500000000000000000',
          reason: 1,
          token_id: '0',
          deadline: 1704067200,
          proof: '0xproof2',
          signatures: ['0xsig2'],
        },
      ]);

      const checks = await Fuul.getClaimableChecks({
        user_identifier: 'user@example.com',
        user_identifier_type: UserIdentifierType.Email,
      });

      expect(checks).toHaveLength(1);
      expect(checks[0].to).toBe('user@example.com');
    });
  });

  describe('getClaimCheckTotals()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-api-key' });
    });

    it('should return claim check totals', async () => {
      const getClaimCheckTotalsSpy = jest.spyOn(ClaimCheckService.prototype, 'getClaimCheckTotals').mockResolvedValue({
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
      });

      const totals = await Fuul.getClaimCheckTotals({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(getClaimCheckTotalsSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(totals).toEqual({
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
      });
    });

    it('should handle empty totals', async () => {
      jest.spyOn(ClaimCheckService.prototype, 'getClaimCheckTotals').mockResolvedValue({
        claimed: [],
        unclaimed: [],
      });

      const totals = await Fuul.getClaimCheckTotals({
        user_identifier: '0x456',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(totals.claimed).toEqual([]);
      expect(totals.unclaimed).toEqual([]);
    });
  });

  describe('getClaimChecks()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-api-key' });
    });

    it('should return claim checks', async () => {
      const getClaimChecksSpy = jest.spyOn(ClaimCheckService.prototype, 'getClaimChecks').mockResolvedValue({
        claim_checks: [
          {
            id: 'uuid-1',
            currency_address: '0xtoken',
            currency_chain_id: '1',
            currency_name: 'USDC',
            currency_decimals: 6,
            reason: 'affiliate_payout',
            amount: '1000000',
            status: 'open',
            deadline_seconds: 1704067200,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
      });

      const result = await Fuul.getClaimChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(getClaimChecksSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result.claim_checks).toHaveLength(1);
      expect(result.claim_checks[0].id).toBe('uuid-1');
      expect(result.claim_checks[0].status).toBe('open');
    });

    it('should handle empty results', async () => {
      jest.spyOn(ClaimCheckService.prototype, 'getClaimChecks').mockResolvedValue({
        claim_checks: [],
      });

      const result = await Fuul.getClaimChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
      });

      expect(result.claim_checks).toEqual([]);
    });

    it('should pass status filter', async () => {
      const getClaimChecksSpy = jest.spyOn(ClaimCheckService.prototype, 'getClaimChecks').mockResolvedValue({
        claim_checks: [],
      });

      await Fuul.getClaimChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        status: 'open' as any,
      });

      expect(getClaimChecksSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        status: 'open',
      });
    });
  });

  describe('closeClaimChecks()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-api-key' });
    });

    it('should close claim checks and return signed responses', async () => {
      const closeClaimChecksSpy = jest.spyOn(ClaimCheckService.prototype, 'closeClaimChecks').mockResolvedValue([
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
      ]);

      const result = await Fuul.closeClaimChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        claim_check_ids: ['uuid-1', 'uuid-2'],
      });

      expect(closeClaimChecksSpy).toHaveBeenCalledWith({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        claim_check_ids: ['uuid-1', 'uuid-2'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].project_address).toBe('0xproject');
      expect(result[0].signatures).toEqual(['0xsig1']);
    });

    it('should handle empty results', async () => {
      jest.spyOn(ClaimCheckService.prototype, 'closeClaimChecks').mockResolvedValue([]);

      const result = await Fuul.closeClaimChecks({
        user_identifier: '0x123',
        user_identifier_type: UserIdentifierType.EvmAddress,
        claim_check_ids: ['uuid-1'],
      });

      expect(result).toEqual([]);
    });
  });

  describe('updateAffiliateCode()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should not pass userRebateRate to affiliate service', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.update.mockResolvedValueOnce();

      await Fuul.updateAffiliateCode({
        userIdentifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
        code: 'my-code',
        signature: 'sig',
        userRebateRate: 0.1,
      });

      expect(affiliateServiceMock.prototype.update).toHaveBeenCalledWith(
        '0x123',
        UserIdentifierType.EvmAddress,
        'my-code',
        'sig',
        undefined,
        undefined,
      );
    });
  });

  describe('updateRebateRate()', () => {
    beforeEach(() => {
      Fuul.init({ apiKey: 'test-key' });
    });

    it('should call updateRebateRate with correct arguments', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.updateRebateRate.mockResolvedValueOnce();

      await Fuul.updateRebateRate({
        userIdentifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
        code: 'my-code',
        signature: 'sig',
        rebateRate: 0.1,
      });

      expect(affiliateServiceMock.prototype.updateRebateRate).toHaveBeenCalledWith(
        '0x123',
        UserIdentifierType.EvmAddress,
        'my-code',
        'sig',
        0.1,
        undefined,
        undefined,
        undefined,
      );
    });

    it('should pass optional parameters', async () => {
      const affiliateServiceMock = AffiliateService as jest.MockedClass<typeof AffiliateService>;
      affiliateServiceMock.prototype.updateRebateRate.mockResolvedValueOnce();

      await Fuul.updateRebateRate({
        userIdentifier: '0x123',
        identifierType: UserIdentifierType.EvmAddress,
        code: 'my-code',
        signature: 'sig',
        rebateRate: 0.15,
        signaturePublicKey: 'pub-key',
        accountChainId: 8453,
        sourceProjectId: 'project-uuid',
      });

      expect(affiliateServiceMock.prototype.updateRebateRate).toHaveBeenCalledWith(
        '0x123',
        UserIdentifierType.EvmAddress,
        'my-code',
        'sig',
        0.15,
        'pub-key',
        8453,
        'project-uuid',
      );
    });
  });
});
