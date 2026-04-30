import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WeekendResult } from '../services/api'

const CACHE_KEY = 'weekend_results'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in ms

interface CachedResult {
  data: WeekendResult
  timestamp: number
  leagues: string[]
}

export const useWeekendCache = (leagues: string[]) => {
  const [cachedResult, setCachedResult] = useState<WeekendResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFromCache()
  }, [leagues.join(',')])

  const loadFromCache = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY)
      if (!cached) {
        setLoading(false)
        return
      }

      const parsed: CachedResult = JSON.parse(cached)
      const isExpired = Date.now() - parsed.timestamp > CACHE_TTL
      const isSameLeagues = JSON.stringify(parsed.leagues.sort()) === JSON.stringify(leagues.sort())

      if (!isExpired && isSameLeagues) {
        setCachedResult(parsed.data)
      } else {
        await AsyncStorage.removeItem(CACHE_KEY)
      }
    } catch (error) {
      console.warn('Cache load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveToCache = async (result: WeekendResult) => {
    try {
      const toCache: CachedResult = {
        data: result,
        timestamp: Date.now(),
        leagues,
      }
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache))
      setCachedResult(result)
    } catch (error) {
      console.warn('Cache save error:', error)
    }
  }

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY)
      setCachedResult(null)
    } catch (error) {
      console.warn('Cache clear error:', error)
    }
  }

  return { cachedResult, loading, saveToCache, clearCache }
}
