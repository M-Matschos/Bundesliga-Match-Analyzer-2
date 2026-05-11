/**
 * @deprecated Nicht aktiv. Produktiver Navigation-Root ist mobile/src/_layout.tsx.
 * Diese Datei ist legacy (Tab-basiert, hardcoded Colors) und wird nicht vom App-Einstieg genutzt.
 * Kann in P2 entfernt werden.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-native-screens/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Types
import type { RootStackParamList, MainTabsParamList, DashboardStackParamList } from './types';

// Screens - Auth
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Screens - Dashboard
import DashboardScreen from '../screens/DashboardScreen';
import MatchDetailsScreen from '../screens/MatchDetailsScreen';

// Screens - Performance Debug
import PerformanceDebugScreen from '../screens/PerformanceDebugScreen';

// Screens - Fixtures (Placeholder)
const FixturesScreen = () => <Text>Spielplan</Text>;

// Screens - Standings (Placeholder)
const StandingsScreen = () => <Text>Tabelle</Text>;

// Screens - Teams (Placeholder)
const TeamsScreen = () => <Text>Vereine</Text>;

// Screens - Profile (Placeholder)
const ProfileScreen = () => <Text>Profil</Text>;

// Navigation Stacks
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

/**
 * Dashboard Stack Navigator
 */
const DashboardStackNavigator: React.FC = () => {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <DashboardStack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'Bundesliga Match Analyzer',
          headerLargeTitle: true,
        }}
      />
      <DashboardStack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={({ route }) => ({
          title: `${route.params.homeTeamName || 'Team A'} vs ${route.params.awayTeamName || 'Team B'}`,
          headerBackButtonDisplayMode: 'minimal',
        })}
      />
    </DashboardStack.Navigator>
  );
};

/**
 * Main Tabs Navigator (Dashboard, Fixtures, Standings, Teams, Profile)
 */
const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F41BB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          title: 'Startseite',
          tabBarLabel: 'Startseite',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>⚽</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Fixtures"
        component={FixturesScreen}
        options={{
          title: 'Spielplan',
          tabBarLabel: 'Spielplan',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📅</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Standings"
        component={StandingsScreen}
        options={{
          title: 'Tabelle',
          tabBarLabel: 'Tabelle',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📊</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          title: 'Vereine',
          tabBarLabel: 'Vereine',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏟️</Text>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Navigator mit Auth & Main Stack
 */
interface RootNavigatorProps {
  isSignedIn: boolean;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ isSignedIn }) => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {isSignedIn ? (
          // Authentifizierte User (Main Stack)
          <RootStack.Group>
            <RootStack.Screen
              name="MainTabs"
              component={MainTabsNavigator}
              options={{
                animationEnabled: false,
              }}
            />
            {/* Performance Debug Screen - Modal overlay */}
            <RootStack.Screen
              name="PerformanceDebug"
              component={PerformanceDebugScreen}
              options={{
                title: 'Performance Debug',
                headerShown: true,
                cardStyle: { backgroundColor: '#FFFFFF' },
              }}
            />
          </RootStack.Group>
        ) : (
          // Nicht authentifizierte User (Auth Stack)
          <RootStack.Group
            screenOptions={{
              animationEnabled: false,
              gestureEnabled: false,
            }}
          >
            <RootStack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                cardStyle: { backgroundColor: '#FFFFFF' },
              }}
            />
            <RootStack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                cardStyle: { backgroundColor: '#FFFFFF' },
              }}
            />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
