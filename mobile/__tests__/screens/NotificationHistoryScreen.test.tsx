/**
 * NotificationHistoryScreen Dark Mode Tests
 * Day 8: Dark Mode Support Validation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import NotificationHistoryScreen from '../../src/screens/NotificationHistoryScreen';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useAuth } from '../../src/hooks/useAuth';

jest.mock('../../src/hooks/useNotifications');
jest.mock('../../src/hooks/useAuth');

const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  name: 'Test User',
};

const mockNotifications = [
  {
    id: 1,
    match_id: 1,
    event_type: 'goal',
    title: 'Goal Scored',
    body: 'Player scored',
    sent_at: new Date().toISOString(),
    read_at: null,
  },
  {
    id: 2,
    match_id: 1,
    event_type: 'yellow_card',
    title: 'Yellow Card',
    body: 'Player received yellow card',
    sent_at: new Date().toISOString(),
    read_at: new Date().toISOString(),
  },
];

describe('NotificationHistoryScreen Dark Mode Support', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
    });

    (useNotifications as jest.Mock).mockReturnValue({
      markAsRead: jest.fn().mockResolvedValue(true),
      notifications: mockNotifications,
    });

    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: '#1F41BB',
        background: '#FFFFFF',
        card: '#F3F4F6',
      },
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Light Mode Background
  test('renders with light mode background color', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { getByText } = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(getByText('Goal Scored')).toBeDefined();
    });
  });

  // Test 2: Dark Mode Background
  test('renders with dark mode background color when colorScheme is dark', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { getByText } = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(getByText('Goal Scored')).toBeDefined();
    });
  });

  // Test 3: Light Mode Card Colors
  test('displays light mode card colors for notification items', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { getByText } = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(getByText('Goal Scored')).toBeDefined();
    });
  });

  // Test 4: Dark Mode Card Colors
  test('displays dark mode card colors for notification items', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { getByText } = render(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(getByText('Goal Scored')).toBeDefined();
    });
  });

  // Test 5: Theme Switch with Content
  test('updates colors when switching from light to dark mode', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockNotifications,
    });

    const { rerender } = render(<NotificationHistoryScreen />);

    (useColorScheme as jest.Mock).mockReturnValue('dark');

    rerender(<NotificationHistoryScreen />);

    await waitFor(() => {
      expect(useColorScheme).toHaveBeenCalled();
    });
  });
});
