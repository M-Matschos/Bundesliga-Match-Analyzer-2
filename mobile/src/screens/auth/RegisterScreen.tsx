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

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>

/**
 * RegisterScreen — New user account creation
 *
 * Features:
 * - Email, password, and optional username inputs
 * - Real-time validation feedback
 * - Password strength indicator
 * - Auto-login after successful registration
 * - Error handling with toast notifications
 * - Navigation back to Login
 * - Keyboard handling (iOS/Android)
 * - Accessibility support
 */
export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
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

    // Check confirm password match
    if (confirmPassword && text !== confirmPassword) {
      setConfirmPasswordError('Passwörter stimmen nicht überein')
    } else {
      setConfirmPasswordError('')
    }
  }

  /**
   * Validate confirm password field
   */
  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text)
    if (text && password && text !== password) {
      setConfirmPasswordError('Passwörter stimmen nicht überein')
    } else {
      setConfirmPasswordError('')
    }
  }

  /**
   * Attempt registration with email and password
   */
  const handleRegister = async () => {
    // Validate all fields before submission
    if (!email) {
      setEmailError('E-Mail-Adresse ist erforderlich')
      return
    }

    if (!password) {
      setPasswordError('Passwort ist erforderlich')
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Passwortbestätigung ist erforderlich')
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

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwörter stimmen nicht überein')
      return
    }

    setLoading(true)
    try {
      await register(email, password, username || undefined)
      toast.success('Registrierung erfolgreich! Sie werden angemeldet...', 2000)
      // Navigation handled by AuthContext redirect
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen'
      toast.error(message, 4000)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if form is valid
   */
  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    password === confirmPassword

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
          <Text style={styles.title}>Neues Konto erstellen</Text>
          <Text style={styles.subtitle}>
            Registrieren Sie sich, um mit der Analyse zu beginnen
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Username Input (Optional) */}
          <FormInputGroup
            label="Benutzername (optional)"
            placeholder="max_mustermann"
            value={username}
            onChangeText={setUsername}
            keyboardType="default"
            autoComplete="username"
            editable={!loading}
            accessibilityLabel="Benutzername (optional)"
            accessibilityHint="Geben Sie einen Benutzernamen ein oder lassen Sie das Feld leer"
          />

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
            accessibilityLabel="E-Mail-Adresse"
            accessibilityHint="Geben Sie Ihre E-Mail-Adresse ein"
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
            accessibilityLabel="Passwort"
            accessibilityHint="Mindestens 6 Zeichen lang"
          />

          {/* Confirm Password Input */}
          <FormInputGroup
            label="Passwort bestätigen"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            error={confirmPasswordError}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
            accessibilityLabel="Passwort bestätigen"
            accessibilityHint="Geben Sie das gleiche Passwort erneut ein"
          />

          {/* Password Strength Hint */}
          {password && !passwordError && (
            <View style={styles.passwordStrengthHint}>
              <Text style={styles.strengthText}>✓ Passwort ist stark genug</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.registerButton,
            !isFormValid && styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!isFormValid || loading}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Registrierung bestätigen"
          accessibilityHint="Erstellt Ihr neues Konto und meldet Sie an"
          accessibilityState={{ disabled: !isFormValid || loading }}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Konto erstellen</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Bereits registriert?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Zur Anmeldeseite"
            accessibilityHint="Öffnet das Anmeldeformular"
          >
            <Text style={styles.loginLink}>Anmelden</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
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
  passwordStrengthHint: {
    backgroundColor: colors.green + '20',
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 6,
  },
  strengthText: {
    fontSize: 12,
    color: colors.green,
    fontFamily: FONTS.label,
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    fontFamily: FONTS.label,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecond,
    fontFamily: FONTS.body,
  },
  loginLink: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    fontFamily: FONTS.label,
  },
})
