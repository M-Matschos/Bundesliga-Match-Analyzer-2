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

import React, { useState, useCallback } from 'react'
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native'
import { colors, spacing, typography } from '../theme'

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
    ? colors.danger
    : isFocused
    ? colors.primary
    : showSuccess
    ? colors.success
    : colors.border

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.body.sm.size,
      fontWeight: `${typography.body.sm.weight}` as any,
      color: colors.text.primary,
      marginBottom: spacing.sm,
      flexDirection: 'row',
    },
    labelText: {
      flex: 1,
    },
    labelRequired: {
      color: colors.danger,
      marginLeft: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor,
      borderRadius: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      fontSize: typography.body.md.size,
      fontWeight: `${typography.body.md.weight}` as any,
      color: colors.text.primary,
      paddingVertical: spacing.sm,
    },
    spinner: {
      marginLeft: spacing.sm,
    },
    messageContainer: {
      marginTop: spacing.xs,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    messageIcon: {
      marginRight: spacing.xs,
      fontSize: 14,
    },
    messageText: {
      flex: 1,
      fontSize: typography.label.sm.size,
      fontWeight: `${typography.label.sm.weight}` as any,
    },
    errorMessage: {
      color: colors.danger,
    },
    successMessage: {
      color: colors.success,
    },
    hint: {
      fontSize: typography.label.sm.size,
      fontWeight: `${typography.label.sm.weight}` as any,
      color: colors.text.muted,
      marginTop: spacing.xs,
    },
  })

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
          placeholderTextColor={colors.text.muted}
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
