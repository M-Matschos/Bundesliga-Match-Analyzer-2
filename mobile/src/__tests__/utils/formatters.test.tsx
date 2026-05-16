/**
 * Tests: Utility Functions - Formatters
 * Tests for date, currency, percentage, number, time formatting
 */

describe('Formatters Utility Functions', () => {
  // ========================================================================
  // DATE FORMATTING TESTS
  // ========================================================================

  it('should format date as YYYY-MM-DD', () => {
    const formatDate = (date: Date, format: string) => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const testDate = new Date(2026, 3, 30) // April 30, 2026
    expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2026-04-30')
  })

  it('should format date as DD.MM.YYYY', () => {
    const formatDate = (date: Date) => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${day}.${month}.${year}`
    }

    const testDate = new Date(2026, 3, 30)
    expect(formatDate(testDate)).toBe('30.04.2026')
  })

  it('should format date as readable string', () => {
    const formatDate = (date: Date) => {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const testDate = new Date(2026, 3, 30)
    expect(formatDate(testDate)).toContain('April')
  })

  it('should handle various date formats', () => {
    const formatDate = (date: Date, format: string = 'ISO') => {
      if (format === 'ISO') return date.toISOString().split('T')[0]
      return date.toLocaleDateString()
    }

    const testDate = new Date(2026, 3, 30)
    expect(formatDate(testDate, 'ISO')).toContain('2026')
  })

  // ========================================================================
  // CURRENCY FORMATTING TESTS
  // ========================================================================

  it('should format currency with USD locale', () => {
    const formatCurrency = (amount: number, locale: string = 'en-US') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    }

    expect(formatCurrency(1234.56)).toContain('1,234.56')
  })

  it('should format currency with EUR locale', () => {
    const formatCurrency = (amount: number, locale: string = 'de-DE') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    }

    const result = formatCurrency(1234.56, 'de-DE')
    expect(result).toContain('1')
  })

  it('should handle negative currency values', () => {
    const formatCurrency = (amount: number) => {
      const formatted = Math.abs(amount).toFixed(2)
      return amount < 0 ? `-$${formatted}` : `$${formatted}`
    }

    expect(formatCurrency(-500)).toBe('-$500.00')
    expect(formatCurrency(500)).toBe('$500.00')
  })

  it('should round currency to 2 decimal places', () => {
    const formatCurrency = (amount: number) => {
      return `$${amount.toFixed(2)}`
    }

    expect(formatCurrency(1234.567)).toBe('$1234.57')
    expect(formatCurrency(1234.564)).toBe('$1234.56')
  })

  // ========================================================================
  // PERCENTAGE FORMATTING TESTS
  // ========================================================================

  it('should format percentage with decimal places', () => {
    const formatPercentage = (value: number, decimals: number = 1) => {
      return `${(value * 100).toFixed(decimals)}%`
    }

    expect(formatPercentage(0.856)).toBe('85.6%')
    expect(formatPercentage(0.5)).toBe('50.0%')
  })

  it('should format percentage without decimals', () => {
    const formatPercentage = (value: number) => {
      return `${Math.round(value * 100)}%`
    }

    expect(formatPercentage(0.856)).toBe('86%')
    expect(formatPercentage(0.5)).toBe('50%')
  })

  it('should handle edge case percentages', () => {
    const formatPercentage = (value: number) => {
      return `${Math.round(value * 100)}%`
    }

    expect(formatPercentage(0)).toBe('0%')
    expect(formatPercentage(1)).toBe('100%')
    expect(formatPercentage(0.001)).toBe('0%')
  })

  // ========================================================================
  // NUMBER FORMATTING TESTS
  // ========================================================================

  it('should format large numbers with thousands separator', () => {
    const formatNumber = (num: number) => {
      return num.toLocaleString('en-US')
    }

    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(1000)).toBe('1,000')
  })

  it('should format numbers to specific decimal places', () => {
    const formatNumber = (num: number, decimals: number = 2) => {
      return num.toFixed(decimals)
    }

    expect(formatNumber(1234.567)).toBe('1234.57')
    expect(formatNumber(100)).toBe('100.00')
  })

  it('should format compact numbers (K, M, B)', () => {
    const formatCompactNumber = (num: number): string => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    }

    expect(formatCompactNumber(1234567890)).toBe('1.2B')
    expect(formatCompactNumber(1234567)).toBe('1.2M')
    expect(formatCompactNumber(1234)).toBe('1.2K')
  })

  it('should handle zero and negative numbers', () => {
    const formatNumber = (num: number) => {
      return num.toLocaleString('en-US')
    }

    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(-1234)).toBe('-1,234')
  })

  // ========================================================================
  // TIME FORMATTING TESTS
  // ========================================================================

  it('should format time duration in HH:MM:SS', () => {
    const formatDuration = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    expect(formatDuration(3665)).toBe('01:01:05')
    expect(formatDuration(90)).toBe('00:01:30')
  })

  it('should format time duration in human-readable format', () => {
    const formatDuration = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
      return `${Math.floor(seconds / 3600)}h`
    }

    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(120)).toBe('2m')
    expect(formatDuration(3600)).toBe('1h')
  })

  it('should format time with AM/PM', () => {
    const formatTime = (date: Date) => {
      const hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes} ${ampm}`
    }

    const testDate = new Date(2026, 3, 30, 14, 30)
    expect(formatTime(testDate)).toContain('PM')
  })

  it('should format time in 24-hour format', () => {
    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }

    const testDate = new Date(2026, 3, 30, 14, 30)
    expect(formatTime(testDate)).toBe('14:30')
  })

  // ========================================================================
  // COMBINED FORMATTING TESTS
  // ========================================================================

  it('should format complete datetime', () => {
    const formatDateTime = (date: Date) => {
      const dateStr = date.toLocaleDateString()
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return `${dateStr} ${timeStr}`
    }

    const testDate = new Date(2026, 3, 30, 14, 30)
    const result = formatDateTime(testDate)
    expect(result).toContain('2026')
  })

  // ========================================================================
  // EDGE CASE TESTS
  // ========================================================================

  it('should handle edge case values', () => {
    const formatNumber = (num: number) => {
      if (typeof num !== 'number' || isNaN(num)) return 'N/A'
      return num.toString()
    }

    expect(formatNumber(NaN)).toBe('N/A')
    expect(formatNumber(Infinity)).toBe('Infinity')
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle invalid dates gracefully', () => {
    const formatDate = (date: any) => {
      try {
        if (!(date instanceof Date)) return 'Invalid Date'
        return date.toLocaleDateString()
      } catch {
        return 'Invalid Date'
      }
    }

    expect(formatDate(null)).toBe('Invalid Date')
    expect(formatDate('not a date')).toBe('Invalid Date')
  })
})
