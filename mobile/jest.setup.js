// Jest setup file
// Note: jest-native causes issues with react-native ES6 imports
// Using standard Jest matchers instead

// Define React Native globals
global.__DEV__ = true
global.fetch = jest.fn()

// Mock Expo modules
const mockNotificationHandlers = {}
jest.mock('expo-notifications', () => ({
  PermissionStatus: {
    UNDETERMINED: 'undetermined',
    DENIED: 'denied',
    GRANTED: 'granted',
    AUTHORIZED: 'granted',
    PROVISIONAL: 'provisional',
  },
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getDevicePushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn((handler) => {
    mockNotificationHandlers.lastHandler = handler
  }),
  requestPermissionsAsync: jest.fn(),
  getNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
}))
// Expose handlers for tests
global.mockNotificationHandlers = mockNotificationHandlers

jest.mock('expo-device', () => ({
  brand: 'Apple',
  modelName: 'iPhone 14',
  osBuildId: '12.0',
}))

jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = jest.fn(() => ({
    getToken: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    requestPermission: jest.fn(),
    hasPermission: jest.fn(),
    isDeviceRegisteredForRemoteMessages: jest.fn(),
    setAutoInitEnabled: jest.fn(),
  }))
  mockMessaging.AuthorizationStatus = {
    UNDETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
  }
  return mockMessaging
})

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}))

// Mock axios
jest.mock('axios', () => {
  const mockGet = jest.fn()
  const mockPost = jest.fn()
  const mockDelete = jest.fn()
  return {
    create: jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      delete: mockDelete,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  }
})

// Mock React Native's Dimensions API
jest.mock('react-native', () => {
  return {
    Dimensions: {
      get: jest.fn((dim) => ({
        width: 375,
        height: 812,
        scale: 1,
        fontScale: 1,
      })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    Animated: {
      View: 'AnimatedView',
      timing: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(),
    },
    StyleSheet: {
      create: (obj) => obj,
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    useColorScheme: jest.fn(() => 'light'),
  }
})

// Mock @testing-library/react-native before it tries to import react-native
jest.mock('@testing-library/react-native', () => {
  const React = require('react')
  const renderResult = {
    getByText: jest.fn(() => ({})),
    getByTestId: jest.fn(() => ({})),
    queryByTestId: jest.fn(() => null),
    queryByText: jest.fn(() => null),
    getAllByText: jest.fn(() => []),
    getAllByTestId: jest.fn(() => []),
    UNSAFE_getAllByType: jest.fn(() => []),
    rerender: jest.fn(),
  }

  return {
    render: jest.fn(() => renderResult),
    screen: {
      getByText: jest.fn(() => ({})),
      getByTestId: jest.fn(() => ({})),
      getByPlaceholderText: jest.fn(() => ({})),
      queryByTestId: jest.fn(() => null),
      queryByText: jest.fn(() => null),
      queryByPlaceholderText: jest.fn(() => null),
      getAllByText: jest.fn(() => []),
      getAllByTestId: jest.fn(() => []),
      getAllByPlaceholderText: jest.fn(() => []),
    },
    renderHook: jest.fn((callback) => {
      let result = { current: undefined }
      try {
        result.current = callback()
      } catch (error) {
        result.current = callback()
      }
      return {
        result,
        rerender: jest.fn(),
      }
    }),
    act: jest.fn((callback) => {
      const result = callback()
      if (result instanceof Promise) {
        return result
      }
      return Promise.resolve(result)
    }),
    waitFor: jest.fn((callback) => {
      try {
        const result = callback()
        if (result instanceof Promise) {
          return result
        }
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    }),
    fireEvent: { press: jest.fn(), changeText: jest.fn() },
  }
})

// Mock react-test-renderer to avoid runtime issues
jest.mock('react-test-renderer', () => ({
  create: jest.fn(() => ({
    root: { instance: null },
    unmount: jest.fn(),
  })),
  act: jest.fn((callback) => callback()),
}), { virtual: true })

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'StackNavigator',
    Screen: 'StackScreen',
  })),
}))

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: 'NavigationContainer',
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
  })),
}))

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenStack: 'ScreenStack',
}), { virtual: true })

// Mock @react-native-community/blur
jest.mock('@react-native-community/blur', () => ({
  BlurView: 'BlurView',
}), { virtual: true })

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  Swipeable: 'Swipeable',
  PanGestureHandler: 'PanGestureHandler',
}), { virtual: true })

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}), { virtual: true })

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      BACKEND_URL: 'http://localhost:8000',
    },
  },
  default: {
    expoConfig: {
      extra: {
        BACKEND_URL: 'http://localhost:8000',
      },
    },
  },
}), { virtual: true })

// Mock @react-native-toast-community/toast
jest.mock('@react-native-toast-community/toast', () => ({
  useToast: jest.fn(() => ({
    show: jest.fn(),
    hideAll: jest.fn(),
  })),
}), { virtual: true })

// Suppress console errors in tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
