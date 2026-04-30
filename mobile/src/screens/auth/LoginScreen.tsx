import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import FormInputGroup from '../../components/FormInputGroup'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { getColors, SPACING, FONTS } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { validateEmail, validatePassword } from '../../utils/validators'

type RootStackParamList = {
  Login: undefined
  Register: undefined
  Dashboard: undefined
}

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>

/**
 * LoginScreen — User authentication entry point
 *
 * Features:
 * - Email & password input with validation
 * - Persisted authentication via AsyncStorage
 * - Error handling with toast notifications
 * - Loading state during API call
 * - Navigation to Register and Dashboard
 * - Keyboard handling (iOS/Android)
 * - Accessibility support
 */
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { mode } = useTheme()
  const colors = getColors(mode)
  const toast = useToast()

  /**
   * Validate email field
   */
  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (text && !validateEmail(text)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    } else {
      setEmailError('')
    }
  }

  /**
   * Validate password field
   */
  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (text && !validatePassword(text)) {
      setPasswordError('Passwort muss mindestens 6 Zeichen lang sein')
    } else {
      setPasswordError('')
    }
  }

  /**
   * Attempt login with email and password
   */
  const handleLogin = async () => {
    // Validate both fields before submission
    if (!email) {
      setEmailError('E-Mail-Adresse ist erforderlich')
      return
    }

    if (!password) {
      setPasswordError('Passwort ist erforderlich')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Bitte geben Sie eine gültige E-Mail-Adresse ein')
      return
    }

    if (!validatePassword(password)) {
      setPasswordError('Passwort muss mindestens 6 Zeichen lang sein')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success('Erfolgreich angemeldet!', 2000)
      // Navigation handled by AuthContext redirect
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen'
      toast.error(message, 4000)
      setPasswordError('') // Clear password field on error
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if form is valid
   */
  const isFormValid = email && password && !emailError && !passwordError

  /**
   * Create dynamic styles based on current theme
   */
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.xl,
          justifyContent: 'center',
        },
        headerSection: {
          marginBottom: SPACING.xl,
          marginTop: SPACING.lg,
        },
        title: {
          fontSize: 32,
          fontWeight: '700',
          color: colors.text,
          marginBottom: SPACING.xs,
          fontFamily: FONTS.heading,
        },
        subtitle: {
          fontSize: 16,
          color: colors.textSecond,
          fontFamily: FONTS.body,
          lineHeight: 24,
        },
        formSection: {
          marginBottom: SPACING.xl,
        },
        forgotPasswordButton: {
          alignSelf: 'flex-end',
          marginTop: SPACING.sm,
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
        },
        forgotPasswordText: {
          fontSize: 14,
          color: colors.blue,
          fontFamily: FONTS.label,
          fontWeight: '500',
        },
        loginButton: {
          backgroundColor: colors.blue,
          borderRadius: 12,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          marginBottom: SPACING.lg,
          elevation: 4,
          shadowColor: colors.blue,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        loginButtonDisabled: {
          backgroundColor: colors.border,
          opacity: 0.6,
          elevation: 0,
          shadowOpacity: 0,
        },
        loginButtonText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          fontFamily: FONTS.label,
        },
        registerSection: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: SPACING.md,
        },
        registerText: {
          fontSize: 14,
          color: colors.textSecond,
          fontFamily: FONTS.body,
        },
        registerLink: {
          fontSize: 14,
          color: colors.blue,
          fontWeight: '600',
          fontFamily: FONTS.label,
          marginLeft: SPACING.xs,
        },
      }),
    [colors]
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Willkommen zurück</Text>
          <Text style={styles.subtitle}>
            Melden Sie sich an, um Ihre Prognosen zu sehen
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <FormInputGroup
            label="E-Mail-Adresse"
            placeholder="max@example.com"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
            accessibilityLabel="E-Mail-Adresse für Anmeldung"
            accessibilityHint="Geben Sie Ihre registrierte E-Mail-Adresse ein"
          />

          {/* Password Input */}
          <FormInputGroup
            label="Passwort"
            placeholder="••••••••"
            value={password}
            onChangeText={handlePasswordChange}
            error={passwordError}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
            accessibilityLabel="Passwort für Anmeldung"
            accessibilityHint="Geben Sie Ihr Passwort ein"
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Passwort vergessen"
            accessibilityHint="Öffnet Seite zum Zurücksetzen des Passworts"
          >
            <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            !isFormValid && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!isFormValid || loading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Anmeldung bestätigen"
          accessibilityHint="Bestätigt Ihre Anmeldungsdaten und meldet Sie an"
          accessibilityState={{ disabled: !isFormValid || loading }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Anmelden</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>Noch kein Konto?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Zur Registrierungsseite"
            accessibilityHint="Öffnet das Registrierungsformular für neue Benutzer"
          >
            <Text style={styles.registerLink}>Registrieren</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
