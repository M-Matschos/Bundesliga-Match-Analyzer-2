/**
 * useRegisterDevice Hook
 * Handles device token registration, caching, refresh, and unregistration
 */

import { useEffect, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import * as Device from 'expo-device'
import { getDeviceToken, onDeviceTokenRefresh } from '../config/firebase.config'
import { useAuth } from './useAuth'

const STORAGE_KEY_DEVICE_TOKEN = '@match_oracle:device_token'
const STORAGE_KEY_LAST_REGISTERED = '@match_oracle:last_registered_token'
const TOKEN_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface UseRegisterDeviceResult {
  isRegistering: boolean
  error: string | null
}

export function useRegisterDevice(): UseRegisterDeviceResult {
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, authToken } = useAuth()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const registerDevice = async () => {
      try {
        if (!user || !authToken) {
          console.warn('Cannot register device: user not authenticated')
          return
        }

        setIsRegistering(true)
        setError(null)

        // Get FCM token
        const deviceToken = await getDeviceToken()
        if (!deviceToken) {
          setError('Could not obtain device token')
          setIsRegistering(false)
          return
        }

        // Check cache validity
        const cachedToken = await AsyncStorage.getItem(STORAGE_KEY_DEVICE_TOKEN)
        const lastRegistered = await AsyncStorage.getItem(
          STORAGE_KEY_LAST_REGISTERED
        )

        if (cachedToken === deviceToken && lastRegistered) {
          const lastRegisteredTime = new Date(lastRegistered).getTime()
          const now = Date.now()
          const timeSinceRegistration = now - lastRegisteredTime

          if (timeSinceRegistration < TOKEN_CACHE_DURATION) {
            console.debug('Device token still valid, skipping registration')
            setIsRegistering(false)
            return
          }
        }

        // Register device
        const deviceName = `${Device.brand}-${Device.modelName}`

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/register-device`,
          {
            device_token: deviceToken,
            device_name: deviceName,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )

        if (!response.data.success) {
          setError(response.data.message || 'Failed to register device')
          setIsRegistering(false)
          return
        }

        // Cache token
        await AsyncStorage.setItem(STORAGE_KEY_DEVICE_TOKEN, deviceToken)
        await AsyncStorage.setItem(
          STORAGE_KEY_LAST_REGISTERED,
          new Date().toISOString()
        )

        // Log success (redact token)
        const redactedToken = `${deviceToken.slice(0, 15)}...`
        console.log('Device token registered successfully:', {
          token: redactedToken,
          deviceName,
        })

        setIsRegistering(false)
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error occurred'
        setError(errorMessage)
        console.error('Device registration error:', err)
        setIsRegistering(false)
      }
    }

    const setupTokenRefreshListener = () => {
      unsubscribeRef.current = onDeviceTokenRefresh((newToken: string) => {
        if (isRegistering) {
          console.debug('Device registration already in progress')
          return
        }

        registerDevice()
      })
    }

    registerDevice()
    setupTokenRefreshListener()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [user?.id, authToken])

  // Unregister on logout
  useEffect(() => {
    if (user === null && authToken) {
      const unregisterDevice = async () => {
        try {
          const cachedToken = await AsyncStorage.getItem(STORAGE_KEY_DEVICE_TOKEN)
          if (cachedToken) {
            await axios.delete(
              `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/unsubscribe`,
              {
                params: {
                  device_token: cachedToken,
                },
              }
            )

            await AsyncStorage.removeItem(STORAGE_KEY_DEVICE_TOKEN)
            await AsyncStorage.removeItem(STORAGE_KEY_LAST_REGISTERED)

            console.log('Device unregistered successfully')
          }
        } catch (err) {
          console.error('Device unregistration error:', err)
          // Continue logout even if unregistration fails
        }
      }

      unregisterDevice()
    }
  }, [user, authToken])

  return { isRegistering, error }
}
