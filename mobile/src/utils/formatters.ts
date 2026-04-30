import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

// Date & Time
export const formatDate = (isoString: string, locale: 'de' | 'en' = 'de') => {
  try {
    const date = parseISO(isoString)
    return format(date, 'dd.MM.yyyy', { locale: locale === 'de' ? de : undefined })
  } catch (error) {
    console.warn('Invalid date string:', isoString)
    return '—'
  }
}

export const formatTime = (isoString: string) => {
  try {
    const date = parseISO(isoString)
    return format(date, 'HH:mm')
  } catch (error) {
    console.warn('Invalid time string:', isoString)
    return '—'
  }
}

export const formatDateTime = (isoString: string, locale: 'de' | 'en' = 'de') => {
  try {
    const date = parseISO(isoString)
    return format(date, 'dd.MM.yyyy HH:mm', { locale: locale === 'de' ? de : undefined })
  } catch (error) {
    console.warn('Invalid datetime string:', isoString)
    return '—'
  }
}

export const formatRelativeTime = (isoString: string) => {
  try {
    const date = parseISO(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'gerade eben'
    if (diffMins < 60) return `vor ${diffMins}min`
    if (diffHours < 24) return `vor ${diffHours}h`
    if (diffDays < 7) return `vor ${diffDays}d`
    return formatDate(isoString)
  } catch (error) {
    return '—'
  }
}

// Probabilities
export const formatProbability = (prob: number | undefined): string => {
  if (prob === undefined || prob === null) return '—'
  return `${Math.round(Math.max(0, Math.min(1, prob)) * 100)}%`
}

export const formatConfidence = (
  confidence: number | undefined
): 'HOCH' | 'MITTEL' | 'NIEDRIG' => {
  if (!confidence) return 'NIEDRIG'
  if (confidence >= 0.7) return 'HOCH'
  if (confidence >= 0.5) return 'MITTEL'
  return 'NIEDRIG'
}

// Financial
export const formatOdds = (odds: number | undefined): string => {
  if (odds === undefined || odds === null) return '—'
  return odds.toFixed(2)
}

export const formatCurrency = (amount: number | undefined, currency = '€'): string => {
  if (amount === undefined || amount === null) return '—'
  return `${amount.toFixed(2)}${currency}`
}

export const formatEdgePercent = (edge: number | undefined): string => {
  if (edge === undefined || edge === null) return '—'
  return `${edge > 0 ? '+' : ''}${edge.toFixed(1)}%`
}

// Sports
export const formatScore = (home: number | undefined, away: number | undefined): string => {
  if (home === undefined || away === undefined) return '—'
  return `${home}:${away}`
}

export const formatXG = (xg: number | undefined): string => {
  if (xg === undefined || xg === null) return '—'
  return xg.toFixed(2)
}

export const formatGoals = (goals: number | undefined): string => {
  if (goals === undefined || goals === null) return '—'
  return goals.toString()
}

// Teams
export const formatTeamName = (name: string, maxLength = 20): string => {
  if (!name) return '—'
  if (name.length > maxLength) {
    return name.substring(0, maxLength - 1) + '…'
  }
  return name
}

// League/Tournament names
export const formatLeagueName = (leagueId: string): string => {
  const names: Record<string, string> = {
    bundesliga: 'Bundesliga',
    'bundesliga-2': '2. Bundesliga',
    'dfb-pokal': 'DFB-Pokal',
    'premiere-league': 'Premier League',
    'la-liga': 'La Liga',
    'serie-a': 'Serie A',
    'ligue-1': 'Ligue 1',
  }
  return names[leagueId] || leagueId
}

// Match status
export const formatMatchStatus = (status: string | undefined): string => {
  const statusMap: Record<string, string> = {
    scheduled: 'Anstehend',
    live: '🔴 Live',
    finished: 'Beendet',
    postponed: 'Verschoben',
    cancelled: 'Abgesagt',
  }
  return statusMap[status || ''] || status || '—'
}

// Numbers
export const formatNumber = (num: number | undefined, decimals = 0): string => {
  if (num === undefined || num === null) return '—'
  return num.toLocaleString('de-DE', { maximumFractionDigits: decimals })
}
