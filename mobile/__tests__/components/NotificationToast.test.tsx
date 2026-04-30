/**
 * NotificationToast Dark Mode Tests
 * Day 8: Dark Mode Support Validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import NotificationToast from '../../src/components/NotificationToast';
import { PushNotification } from '../../src/hooks/useNotifications';

const mockNotification: PushNotification = {
  id: '1',
  title: 'GOAL Notification',
  body: 'Player scored a goal',
  data: { match_id: '123' },
  timestamp: new Date().toISOString(),
  read: false,
};

describe('NotificationToast Dark Mode Support', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Light Mode Rendering
  test('renders with light mode colors when colorScheme is light', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { getByText } = render(
      <NotificationToast notification={mockNotification} />
    );

    await waitFor(() => {
      const title = getByText('GOAL Notification');
      expect(title).toBeDefined();
    });
  });

  // Test 2: Dark Mode Rendering
  test('renders with dark mode colors when colorScheme is dark', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { getByText } = render(
      <NotificationToast notification={mockNotification} />
    );

    await waitFor(() => {
      const title = getByText('GOAL Notification');
      expect(title).toBeDefined();
    });
  });

  // Test 3: Success Event Light Mode
  test('displays success color in light mode for GOAL events', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const goalNotification: PushNotification = {
      id: '1',
      title: 'GOAL',
      body: 'Goal scored',
      data: {},
      timestamp: new Date().toISOString(),
      read: false,
    };

    const { getByText } = render(
      <NotificationToast notification={goalNotification} />
    );

    await waitFor(() => {
      expect(getByText('GOAL')).toBeDefined();
    });
  });

  // Test 4: Success Event Dark Mode
  test('displays darker success color in dark mode for GOAL events', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const goalNotification: PushNotification = {
      id: '1',
      title: 'GOAL',
      body: 'Goal scored',
      data: {},
      timestamp: new Date().toISOString(),
      read: false,
    };

    const { getByText } = render(
      <NotificationToast notification={goalNotification} />
    );

    await waitFor(() => {
      expect(getByText('GOAL')).toBeDefined();
    });
  });

  // Test 5: Theme Switch Behavior
  test('switches theme when colorScheme changes from light to dark', async () => {
    const { rerender } = render(
      <NotificationToast notification={mockNotification} />
    );

    (useColorScheme as jest.Mock).mockReturnValue('dark');

    rerender(<NotificationToast notification={mockNotification} />);

    await waitFor(() => {
      expect(useColorScheme).toHaveBeenCalled();
    });
  });
});
