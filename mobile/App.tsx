import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider } from './src/context/AuthContext'
import { ToastProvider } from './src/context/ToastContext'
import RootNavigator from './src/_layout'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  )
}
