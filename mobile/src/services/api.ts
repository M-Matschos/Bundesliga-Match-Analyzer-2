/**
 * Match Oracle — API Service
 * Alle API-Calls zur Backend-API
 */
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.matchoracle.app/api/v1'

// Axios Instance mit Auto-Token
const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000 })

// Token automatisch anhängen
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


// ─── Types ───────────────────────────────────────────────────

export interface WeekendRequest {
  leagues: ('bundesliga' | 'bundesliga2' | 'premier-league' | 'championship' | 'all')[]
  date_from?: string
  date_to?: string
  simulations?: number
}

export interface Prediction {
  home_win: number
  draw: number
  away_win: number
  confidence: number
  confidence_label: 'HOCH' | 'MITTEL' | 'NIEDRIG'
  most_likely_score: string
  most_likely_score_prob: number
  expected_goals_home: number
  expected_goals_away: number
  over_2_5_prob: number
  btts_prob: number
  top_scores: Record<string, number>
  value_bet?: {
    exists: boolean
    selection?: string
    edge_percent?: number
    best_odds?: number
    best_bookmaker?: string
    kelly_stake_100?: number
  }
  shap_top3: Array<{ factor: string; impact: number }>
}

export interface Match {
  match_id: string
  kickoff: string
  status: string
  league: string
  matchday: number
  stadium: string
  home_team: { id: string; name: string; logo_url: string }
  away_team: { id: string; name: string; logo_url: string }
  home_goals?: number
  away_goals?: number
  prediction?: Prediction
  tipico_deeplink?: string
  weather?: { temp_celsius: number; condition: string; rain_probability: number }
}

export interface WeekendResult {
  job_id: string
  status: 'calculating' | 'completed' | 'error'
  calculated_at?: string
  matches: Match[]
  summary?: {
    total_matches: number
    high_confidence: number
    medium_confidence: number
    low_confidence: number
    value_bets_found: number
  }
}


// ─── Weekend Calculator ──────────────────────────────────────

export const weekendService = {
  /** Startet Wochenend-Berechnung, gibt job_id zurück */
  async startCalculation(request: WeekendRequest): Promise<{ job_id: string; total_matches: number; estimated_seconds: number }> {
    const { data } = await api.post('/weekend/calculate', request)
    return data
  },

  /** Holt Ergebnis / Fortschritt für einen Job */
  async getResults(jobId: string): Promise<WeekendResult> {
    const { data } = await api.get(`/weekend/results/${jobId}`)
    return data
  },

  /** Nächstes Wochenende ermitteln */
  async getNextWeekend(leagues = 'bundesliga,bundesliga2') {
    const { data } = await api.get(`/weekend/next?leagues=${leagues}`)
    return data
  },

  /** Bestimmten Spieltag berechnen */
  async getMatchday(league: string, matchday: number) {
    const { data } = await api.get(`/weekend/matchday/${league}/${matchday}`)
    return data
  },

  /**
   * Polling-Helfer: Wartet bis Job fertig, mit Progress-Callback
   * @example
   * const result = await weekendService.waitForCompletion(jobId, setProgress)
   */
  async waitForCompletion(
    jobId: string,
    onProgress?: (progress: number, currentMatch?: string) => void,
    pollInterval = 1000,
    maxWait = 60000
  ): Promise<WeekendResult> {
    const start = Date.now()
    return new Promise((resolve, reject) => {
      const poll = setInterval(async () => {
        if (Date.now() - start > maxWait) {
          clearInterval(poll)
          reject(new Error('Timeout: Berechnung dauert zu lange'))
          return
        }
        try {
          const result = await weekendService.getResults(jobId)
          if (result.status === 'completed') {
            clearInterval(poll)
            resolve(result)
          } else if (result.status === 'error') {
            clearInterval(poll)
            reject(new Error('Berechnungsfehler'))
          } else if (onProgress) {
            const progress = result.matches?.filter(m => m.prediction).length
            onProgress(progress ?? 0, undefined)
          }
        } catch (e) {
          clearInterval(poll)
          reject(e)
        }
      }, pollInterval)
    })
  }
}


// ─── Matches ─────────────────────────────────────────────────

export const matchService = {
  async getMatches(params?: { league?: string; matchday?: number; status?: string }) {
    const { data } = await api.get('/matches', { params })
    return data
  },
  async getMatch(id: string): Promise<Match> {
    const { data } = await api.get(`/matches/${id}`)
    return data
  },
  async getLiveMatches() {
    const { data } = await api.get('/matches/live')
    return data
  }
}


// ─── Teams ───────────────────────────────────────────────────

export const teamService = {
  async getTeams(league?: string) {
    const { data } = await api.get('/teams', { params: { league } })
    return data
  },
  async getTeam(id: string) {
    const { data } = await api.get(`/teams/${id}`)
    return data
  },
  async getTeamForm(id: string, games = 10) {
    const { data } = await api.get(`/teams/${id}/form?games=${games}`)
    return data
  },
  async getH2H(homeId: string, awayId: string) {
    const { data } = await api.get(`/teams/${homeId}/h2h/${awayId}`)
    return data
  }
}


// ─── Virtual Betting ─────────────────────────────────────────

export const bettingService = {
  async getMyBets(status?: string) {
    const { data } = await api.get('/virtual-bets', { params: { status } })
    return data
  },
  async placeBet(matchId: string, betType: string, odds: number, amount: number) {
    const { data } = await api.post('/virtual-bets', null, {
      params: { match_id: matchId, bet_type: betType, odds, amount },
    })
    return data
  },
  async getBetDetail(betId: string) {
    const { data } = await api.get(`/virtual-bets/${betId}`)
    return data
  },
  async getPortfolioStats() {
    const { data } = await api.get('/virtual-bets/statistics/portfolio')
    return data
  },
  async cancelBet(betId: string) {
    const { data } = await api.post(`/virtual-bets/${betId}/cancel`)
    return data
  },
}


// ─── Predictions ─────────────────────────────────────────────

export const predictionService = {
  async getPrediction(matchId: string) {
    const { data } = await api.get(`/predictions/${matchId}`)
    return data
  },
  async getValueBets(minEdge = 5) {
    const { data } = await api.get('/predictions/value-bets', { params: { min_edge: minEdge } })
    return data
  },
  async simulatePrediction(homeTeam: string, awayTeam: string, params?: any) {
    const { data } = await api.post('/predictions/simulate', {
      home_team: homeTeam,
      away_team: awayTeam,
      ...params,
    })
    return data
  },
  async getTeamStrength(teamId: string) {
    const { data } = await api.get(`/predictions/team-strength/${teamId}`)
    return data
  },
  async getModelComparison(matchId: string) {
    const { data } = await api.get(`/predictions/match-comparison/${matchId}`)
    return data
  },
}


// ─── Authentication ──────────────────────────────────────────

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export const authService = {
  async register(email: string, password: string): Promise<User> {
    const { data } = await api.post('/auth/register', { email, password })
    return data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token)
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token)
      }
    }
    return data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      await AsyncStorage.removeItem('auth_token')
      await AsyncStorage.removeItem('refresh_token')
    }
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/me')
    return data
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await AsyncStorage.getItem('refresh_token')
    if (!refreshToken) throw new Error('No refresh token available')

    const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken })
    if (data.access_token) {
      await AsyncStorage.setItem('auth_token', data.access_token)
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token)
      }
    }
    return data
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem('auth_token')
    return !!token
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token')
  },
}


// ─── Global Error Handler ────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Token expired → refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await authService.refreshToken()
        const token = await authService.getToken()
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        await authService.logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
