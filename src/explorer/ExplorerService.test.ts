import 'jest-localstorage-mock';

import { HttpClient } from '../HttpClient';
import { ExplorerService } from './ExplorerService';

describe('ExplorerService', () => {
  describe('getIncentiveRewards', () => {
    it('should make GET request with correct params', async () => {
      // Arrange
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({
          data: {
            page: 1,
            page_size: 25,
            total_items: 100,
            calculation_date: '2024-10-29T15:09:54.752Z',
            items: [{
              conversion_id: '052cb741-18de-4bf2-bce2-93ecc10a0601',
              conversion_external_id: 1,
              project_id: '50ef5d87-b7b3-495f-9820-921d01116fec'
            }]
          }
        }),
        post: jest.fn(),
        client: {} as any,
        queryParams: jest.fn(),
        buildQueryParams: jest.fn(),
      } as unknown as HttpClient;

      const service = new ExplorerService({ httpClient: httpClientMock });

      const params = {
        page: 1,
        page_size: 25,
        trigger_chain_id: 1,
        payout_chain_id: 1
      };

      // Act
      const result = await service.getIncentiveRewards(params);

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/explorer/v1/listings/incentive-rewards',
        params
      );
      expect(result).toEqual({
        page: 1,
        page_size: 25,
        total_items: 100,
        calculation_date: '2024-10-29T15:09:54.752Z',
        items: [{
          conversion_id: '052cb741-18de-4bf2-bce2-93ecc10a0601',
          conversion_external_id: 1,
          project_id: '50ef5d87-b7b3-495f-9820-921d01116fec'
        }]
      });
    });
  });

  describe('getReferralRewards', () => {
    it('should make GET request with correct params', async () => {
      // Arrange
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({
          data: {
            page: 1,
            page_size: 25,
            total_items: 100,
            calculation_date: '2024-10-29T15:09:54.752Z',
            items: [{
              conversion_id: '052cb741-18de-4bf2-bce2-93ecc10a0601',
              conversion_external_id: 1,
              project_id: '50ef5d87-b7b3-495f-9820-921d01116fec'
            }]
          }
        }),
        post: jest.fn(),
        client: {} as any,
        queryParams: jest.fn(),
        buildQueryParams: jest.fn(),
      } as unknown as HttpClient;

      const service = new ExplorerService({ httpClient: httpClientMock });

      const params = {
        page: 1,
        page_size: 25,
        trigger_chain_id: 1,
        payout_chain_id: 1
      };

      // Act
      const result = await service.getReferralRewards(params);

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/explorer/v1/listings/referral-rewards',
        params
      );
      expect(result).toEqual({
        page: 1,
        page_size: 25,
        total_items: 100,
        calculation_date: '2024-10-29T15:09:54.752Z',
        items: [{
          conversion_id: '052cb741-18de-4bf2-bce2-93ecc10a0601',
          conversion_external_id: 1,
          project_id: '50ef5d87-b7b3-495f-9820-921d01116fec'
        }]
      });
    });
  });

  describe('getRewardDetails', () => {
    it('should make GET request with correct params', async () => {
      // Arrange
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({
          data: {
            project_id: 'e3f96f0d-4234-4204-a3d1-f88c2ab1cad2',
            conversion_external_id: 1,
            project_name: 'Test project',
            project_chain_id: 1,
            calculation_date: '2024-10-29T15:09:54.752Z'
          }
        }),
        post: jest.fn(),
        client: {} as any,
        queryParams: jest.fn(),
        buildQueryParams: jest.fn(),
      } as unknown as HttpClient;

      const service = new ExplorerService({ httpClient: httpClientMock });

      const params = {
        type: 'incentive' as const,
        project_id: 'test-id',
        conversion_external_id: '1'
      };

      // Act
      const result = await service.getRewardDetails(params);

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/explorer/v1/details',
        params
      );
      expect(result).toEqual({
        project_id: 'e3f96f0d-4234-4204-a3d1-f88c2ab1cad2',
        conversion_external_id: 1,
        project_name: 'Test project',
        project_chain_id: 1,
        calculation_date: '2024-10-29T15:09:54.752Z'
      });
    });
  });

  describe('getProjectDetails', () => {
    it('should make GET request with correct project id', async () => {
      // Arrange
      const httpClientMock = {
        get: jest.fn().mockResolvedValue({
          data: {
            id: 'project-1',
            integration_type: 'incentive',
            user_onboarding_page_url: 'http://www.page.com',
            category: 'incentive',
            description: 'incentive',
            calculation_date: '2024-10-29T15:09:54.752Z'
          }
        }),
        post: jest.fn(),
        client: {} as any,
        queryParams: jest.fn(),
        buildQueryParams: jest.fn(),
      } as unknown as HttpClient;

      const service = new ExplorerService({ httpClient: httpClientMock });

      const projectId = 'test-project-id';

      // Act
      const result = await service.getProjectDetails(projectId);

      // Assert
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/explorer/v1/projects/${projectId}`
      );
      expect(result).toEqual({
        id: 'project-1',
        integration_type: 'incentive',
        user_onboarding_page_url: 'http://www.page.com',
        category: 'incentive',
        description: 'incentive',
        calculation_date: '2024-10-29T15:09:54.752Z'
      });
    });
  });
});