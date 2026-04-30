/**
 * FormInputGroup Component (React Native)
 *
 * Mobile version of form input with label, error/success messages, and validation states.
 * Cross-platform compatible with Desktop React version.
 *
 * Usage:
 * <FormInputGroup
 *   label="E-Mail"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   hint="We'll never share your email"
 *   required
 * />
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { useThemeColors } from '../hooks/useTheme'

interface FormInputGroupProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  success?: string | boolean
  disabled?: boolean
  loading?: boolean
  required?: boolean
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoComplete?: 'email' | 'password' | 'username' | 'off'
  testID?: string
}

export default function FormInputGroup({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  success,
  disabled = false,
  loading = false,
  required = false,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  testID,
}: FormInputGroupProps) {
  const colors = useThemeColors()
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error
  const showSuccess = typeof success === 'string' ? success : success && !hasError

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  // Dynamic border color based on state
  const borderColor = hasError
    ? colors.red
    : isFocused
    ? colors.primary
    : showSuccess
    ? colors.green
    : colors.border

  const styles = useMemo(() => createStyles(colors, borderColor), [colors, borderColor])

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.label}>
        <Text style={styles.labelText}>{label}</Text>
        {required && <Text style={styles.labelRequired}>*</Text>}
      </View>

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={!disabled && !loading}
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityRole="text"
        />

        {/* Loading Spinner */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageIcon}>❌</Text>
          <Text style={[styles.messageText, styles.errorMessage]}>
            {error}
          </Text>
        </View>
      )}

      {/* Success Message */}
      {showSuccess && typeof showSuccess === 'string' && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageIcon}>✅</Text>
          <Text style={[styles.messageText, styles.successMessage]}>
            {showSuccess}
          </Text>
        </View>
      )}

      {/* Hint Text */}
      {hint && !hasError && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  )
}

const createStyles = (colors: ReturnType<typeof getColors>, borderColor: string) => StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: SPACING.sm,
    flexDirection: 'row' as any,
  },
  labelText: {
    flex: 1,
  },
  labelRequired: {
    color: colors.red,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    paddingVertical: SPACING.sm,
  },
  spinner: {
    marginLeft: SPACING.sm,
  },
  messageContainer: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  messageIcon: {
    marginRight: SPACING.xs,
    fontSize: 14,
  },
  messageText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  errorMessage: {
    color: colors.red,
  },
  successMessage: {
    color: colors.green,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: SPACING.xs,
  },
})
