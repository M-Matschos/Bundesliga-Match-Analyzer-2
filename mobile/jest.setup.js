// Jest setup file for Bundesliga Match Analyzer
// Configures mocks for React Native, Expo, Firebase, and other dependencies

// ============================================================================
// GLOBALS & INITIALIZATION
// ============================================================================

global.__DEV__ = true
global.fetch = jest.fn()

// ============================================================================
// EXPO & NOTIFICATION MOCKS
// ============================================================================

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

global.mockNotificationHandlers = mockNotificationHandlers

jest.mock('expo-device', () => ({
  brand: 'Apple',
  modelName: 'iPhone 14',
  osBuildId: '12.0',
}))

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

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}), { virtual: true })

// ============================================================================
// FIREBASE MOCKS
// ============================================================================

jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('test_token_123'),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    requestPermission: jest.fn().mockResolvedValue(1),
    hasPermission: jest.fn().mockResolvedValue(1),
    isDeviceRegisteredForRemoteMessages: jest.fn().mockResolvedValue(true),
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

// ============================================================================
// ASYNC STORAGE MOCKS
// ============================================================================

const mockAsyncStorage = {
  getItem: jest.fn(async (key) => null),
  setItem: jest.fn(async (key, value) => undefined),
  removeItem: jest.fn(async (key) => undefined),
  clear: jest.fn(async () => undefined),
  multiGet: jest.fn(async (keys) => keys.map(key => [key, null])),
  multiSet: jest.fn(async (items) => undefined),
  getAllKeys: jest.fn(async () => []),
  flushGetRequests: jest.fn(async () => undefined),
}

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)
global.mockAsyncStorage = mockAsyncStorage

// ============================================================================
// NETWORK MOCKS
// ============================================================================

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

// ============================================================================
// REACT NATIVE MOCKS
// ============================================================================

const mockColorScheme = 'light'

jest.mock('react-native', () => ({
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
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  ActivityIndicator: 'ActivityIndicator',
  RefreshControl: 'RefreshControl',
  Image: 'Image',
  ImageBackground: 'ImageBackground',
  Switch: 'Switch',
  TextInput: 'TextInput',
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    dismiss: jest.fn(),
  },
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
    setTranslucent: jest.fn(),
  },
  SafeAreaView: 'SafeAreaView',
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
    Version: 14,
  },
  useColorScheme: jest.fn(() => mockColorScheme),
  useWindowDimensions: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  })),
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  UIManager: {
    setLayoutAnimationEnabledExperimental: jest.fn(),
  },
  Animated: {
    View: 'AnimatedView',
    ScrollView: 'AnimatedScrollView',
    timing: jest.fn((value, config) => ({
      start: jest.fn(),
    })),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    createValue: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
    })),
  },
  StyleSheet: {
    create: (obj) => obj,
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    Presets: {
      easeInEaseOut: {},
      linear: {},
      spring: {},
    },
  },
}))

global.mockColorScheme = mockColorScheme

// ============================================================================
// REACT NAVIGATION MOCKS
// ============================================================================

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  setParams: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
}

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: 'NavigationContainer',
  useNavigation: jest.fn(() => mockNavigation),
  useRoute: jest.fn(() => ({
    params: {},
    key: 'test-route',
    name: 'test-screen',
  })),
  useFocusEffect: jest.fn((callback) => {
    if (typeof callback === 'function') {
      callback()
    }
  }),
  useIsFocused: jest.fn(() => true),
  CommonActions: {
    navigate: jest.fn((name) => ({ type: 'NAVIGATE', payload: { name } })),
    goBack: jest.fn(() => ({ type: 'GO_BACK' })),
    reset: jest.fn((payload) => ({ type: 'RESET', payload })),
  },
}))

global.mockNavigation = mockNavigation

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'StackNavigator',
    Screen: 'StackScreen',
  })),
}))

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: 'TabNavigator',
    Screen: 'TabScreen',
  })),
}))

// ============================================================================
// GESTURE & UI MOCKS
// ============================================================================

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  Swipeable: 'Swipeable',
  PanGestureHandler: 'PanGestureHandler',
  LongPressGestureHandler: 'LongPressGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
}), { virtual: true })

jest.mock('@react-native-community/blur', () => ({
  BlurView: 'BlurView',
}), { virtual: true })

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenStack: 'ScreenStack',
}), { virtual: true })

jest.mock('@react-native-toast-community/toast', () => ({
  useToast: jest.fn(() => ({
    show: jest.fn(),
    hideAll: jest.fn(),
  })),
}), { virtual: true })

// ============================================================================
// TESTING LIBRARY SETUP
// ============================================================================

jest.mock('react-test-renderer', () => ({
  create: jest.fn(() => ({
    root: { instance: null },
    unmount: jest.fn(),
  })),
  act: jest.fn((callback) => callback()),
}), { virtual: true })

// ============================================================================
// CONSOLE & WARNINGS
// ============================================================================

const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Non-serializable values') ||
        args[0].includes('Animated') ||
        args[0].includes('useNativeDriver'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// ============================================================================
// MOCK FACTORIES FOR TESTS
// ============================================================================

/**
 * Factory to create mock user objects
 */
global.createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  verified: true,
  ...overrides,
})

/**
 * Factory to create mock match objects
 */
global.createMockMatch = (overrides = {}) => ({
  id: 'match-123',
  homeTeam: { id: 'team-1', name: 'Bayern Munich', logo: 'https://example.com/team1.png' },
  awayTeam: { id: 'team-2', name: 'Borussia Dortmund', logo: 'https://example.com/team2.png' },
  homeScore: 2,
  awayScore: 1,
  status: 'finished',
  date: new Date().toISOString(),
  prediction: { confidence: 0.85, outcome: 'home_win' },
  odds: { home: 1.5, draw: 3.5, away: 5.0 },
  ...overrides,
})

/**
 * Factory to create mock notification objects
 */
global.createMockNotification = (overrides = {}) => ({
  id: 'notif-123',
  title: 'Test Notification',
  body: 'This is a test notification',
  type: 'info',
  read: false,
  timestamp: new Date().toISOString(),
  data: {},
  ...overrides,
})

/**
 * Factory to create mock theme objects
 */
global.createMockTheme = (overrides = {}) => ({
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#2196F3',
    secondary: '#FF9800',
    ...overrides,
  },
})

/**
 * Clear AsyncStorage mocks between tests
 */
global.clearAsyncStorageMocks = () => {
  mockAsyncStorage.getItem.mockClear()
  mockAsyncStorage.setItem.mockClear()
  mockAsyncStorage.removeItem.mockClear()
  mockAsyncStorage.clear.mockClear()
  mockAsyncStorage.multiGet.mockClear()
  mockAsyncStorage.multiSet.mockClear()
}

/**
 * Clear navigation mocks between tests
 */
global.clearNavigationMocks = () => {
  mockNavigation.navigate.mockClear()
  mockNavigation.goBack.mockClear()
  mockNavigation.push.mockClear()
  mockNavigation.dispatch.mockClear()
}

/**
 * Setup after each test
 */
afterEach(() => {
  jest.clearAllMocks()
  clearAsyncStorageMocks()
  clearNavigationMocks()
})
