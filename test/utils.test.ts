/**
 * @jest-environment jsdom
 */

import 'jest-localstorage-mock';
import { saveSentEvent, shouldSendEvent } from '../src/utils/events';

jest.spyOn(Date, 'now').mockImplementation(() => 1626921600000); // Mock date: 2021-07-22

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('shouldSendEvent', () => {
  it('should return true if event was not sent before', () => {
    // Arrange
    const event = {
      name: 'pageview',
      event_args: {},
      timestamp: Date.now() / 1000,
      metadata: {
        tracking_id: '123',
        project_id: 'test-project-id',
      },
    };

    // Act
    const result = shouldSendEvent(event);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true if sent event is expired', () => {
    // Arrange
    const event = {
      name: 'pageview',
      event_args: {},
      timestamp: 1626921000, // Older timestamp (2021-07-22T00:50:00.000Z)
      metadata: {
        tracking_id: '123',
        project_id: 'test-project-id',
      },
    };

    // Act
    saveSentEvent(event);
    const result = shouldSendEvent(event);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false if event metadata matches the sent event', () => {
    // Arrange
    const event = {
      name: 'pageview',
      event_args: {},
      timestamp: 1626921700, // Recent timestamp (2021-07-22T00:55:00.000Z)
      metadata: {
        tracking_id: '123',
        project_id: 'test-project-id',
      },
    };

    // Act
    saveSentEvent(event);
    const result = shouldSendEvent(event);

    // Assert
    expect(result).toBe(false);
  });
});
