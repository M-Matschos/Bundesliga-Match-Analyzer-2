import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { getColors } from '../theme/colors'
import { useThemeColors } from '../hooks/useTheme'

interface Props {
  children: React.ReactNode
  fallback?: (error: Error, retry: () => void) => React.ReactNode
}

interface State {
  error: Error | null
  hasError: boolean
  errorCount: number
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, hasError: false, errorCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Send to error tracking (e.g., Sentry) in production
    if (__DEV__ === false) {
      // TODO: Send to Sentry or other error tracking service
      // Sentry.captureException(error, { contexts: { react: errorInfo } })
    }

    // Increment error count
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }))
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.retry)
      ) : (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.retry}
          errorCount={this.state.errorCount}
        />
      )
    }

    return this.props.children
  }
}

interface FallbackProps {
  error: Error
  onRetry: () => void
  errorCount?: number
}

function DefaultErrorFallback({ error, onRetry, errorCount = 0 }: FallbackProps) {
  const colors = useThemeColors()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        {/* Error Icon */}
        <Text style={{ fontSize: 64, marginBottom: 24 }}>⚠️</Text>

        {/* Error Title */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: colors.red,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Etwas ist schiefgelaufen
        </Text>

        {/* Error Message */}
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecond,
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {error.message || 'Ein unbekannter Fehler ist aufgetreten'}
        </Text>

        {/* Error Details (Dev only) */}
        {__DEV__ && (
          <View
            style={{
              backgroundColor: colors.surfaceHigh,
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
              maxWidth: '100%',
              borderLeftColor: colors.red,
              borderLeftWidth: 4,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: 'monospace',
                marginBottom: 8,
              }}
            >
              {error.name}: {error.message}
            </Text>
            {error.stack && (
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                }}
                numberOfLines={5}
              >
                {error.stack.split('\n').slice(0, 3).join('\n')}
              </Text>
            )}
          </View>
        )}

        {/* Retry Count Warning */}
        {errorCount > 2 && (
          <Text
            style={{
              fontSize: 13,
              color: colors.yellow,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            {errorCount} Fehler - Bitte versuchen Sie später erneut
          </Text>
        )}

        {/* Retry Button */}
        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: colors.blue,
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#FFF',
              textAlign: 'center',
            }}
          >
            Erneut versuchen
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text
          style={{
            fontSize: 12,
            color: colors.textMuted,
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          Wenn das Problem weiterhin besteht, versuchen Sie, die App neu zu starten.
        </Text>
      </ScrollView>
    </View>
  )
}
