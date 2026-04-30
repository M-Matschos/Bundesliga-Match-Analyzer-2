import React, { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
import { useTheme } from '../context/ThemeContext'
  Modal as RNModal,
import { useTheme } from '../context/ThemeContext'
  View,
import { useTheme } from '../context/ThemeContext'
  Text,
import { useTheme } from '../context/ThemeContext'
  TouchableOpacity,
import { useTheme } from '../context/ThemeContext'
  StyleSheet,
import { useTheme } from '../context/ThemeContext'
  ScrollView,
import { useTheme } from '../context/ThemeContext'
  ActivityIndicator,
import { useTheme } from '../context/ThemeContext'
  Pressable,
import { useTheme } from '../context/ThemeContext'
} from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, TYPOGRAPHY } from '../theme/design-tokens'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
/**
import { useTheme } from '../context/ThemeContext'
 * Modal Component (React Native) — Bottom sheet style modal
import { useTheme } from '../context/ThemeContext'
 *
import { useTheme } from '../context/ThemeContext'
 * Slides up from bottom (mobile convention)
import { useTheme } from '../context/ThemeContext'
 * Variants: confirmation, detail, form, alert
import { useTheme } from '../context/ThemeContext'
 * States: closed, open, loading, error
import { useTheme } from '../context/ThemeContext'
 */
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface ModalProps {
import { useTheme } from '../context/ThemeContext'
  isOpen: boolean
import { useTheme } from '../context/ThemeContext'
  onClose: () => void
import { useTheme } from '../context/ThemeContext'
  onConfirm?: () => void
import { useTheme } from '../context/ThemeContext'
  title?: string
import { useTheme } from '../context/ThemeContext'
  children?: React.ReactNode
import { useTheme } from '../context/ThemeContext'
  confirmText?: string
import { useTheme } from '../context/ThemeContext'
  cancelText?: string
import { useTheme } from '../context/ThemeContext'
  loading?: boolean
import { useTheme } from '../context/ThemeContext'
  error?: string
import { useTheme } from '../context/ThemeContext'
  footer?: React.ReactNode | boolean
import { useTheme } from '../context/ThemeContext'
  closeOnBackdrop?: boolean
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export default function Modal({
import { useTheme } from '../context/ThemeContext'
  isOpen = false,
import { useTheme } from '../context/ThemeContext'
  onClose = () => {},
import { useTheme } from '../context/ThemeContext'
  onConfirm = null,
import { useTheme } from '../context/ThemeContext'
  title = '',
import { useTheme } from '../context/ThemeContext'
  children = null,
import { useTheme } from '../context/ThemeContext'
  confirmText = 'Confirm',
import { useTheme } from '../context/ThemeContext'
  cancelText = 'Cancel',
import { useTheme } from '../context/ThemeContext'
  loading = false,
import { useTheme } from '../context/ThemeContext'
  error = null,
import { useTheme } from '../context/ThemeContext'
  footer = null,
import { useTheme } from '../context/ThemeContext'
  closeOnBackdrop = true,
import { useTheme } from '../context/ThemeContext'
}: ModalProps) {
import { useTheme } from '../context/ThemeContext'
  const styles = StyleSheet.create({
import { useTheme } from '../context/ThemeContext'
    overlay: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'flex-end',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    container: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
      borderTopLeftRadius: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      borderTopRightRadius: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      paddingBottom: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      maxHeight: '90%',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    header: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
      paddingVertical: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      borderBottomWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    title: {
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.headingMd.size,
import { useTheme } from '../context/ThemeContext'
      fontWeight: TYPOGRAPHY.headingMd.weight,
import { useTheme } from '../context/ThemeContext'
      color: colors.textPrimary,
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    closeBtn: {
import { useTheme } from '../context/ThemeContext'
      width: 32,
import { useTheme } from '../context/ThemeContext'
      height: 32,
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    closeBtnText: {
import { useTheme } from '../context/ThemeContext'
      fontSize: 24,
import { useTheme } from '../context/ThemeContext'
      color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    content: {
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      paddingVertical: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    error: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      paddingVertical: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      borderWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.danger,
import { useTheme } from '../context/ThemeContext'
      marginBottom: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      alignItems: 'flex-start',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    errorIcon: {
import { useTheme } from '../context/ThemeContext'
      fontSize: 20,
import { useTheme } from '../context/ThemeContext'
      marginRight: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      marginTop: 2,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    errorMessage: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.bodySm.size,
import { useTheme } from '../context/ThemeContext'
      color: colors.dangerLight,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    footer: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      paddingTop: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      borderTopWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderTopColor: colors.border,
import { useTheme } from '../context/ThemeContext'
      gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    button: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      paddingVertical: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      gap: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    buttonText: {
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.bodyMd.size,
import { useTheme } from '../context/ThemeContext'
      fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    buttonPrimary: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.primary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    buttonPrimaryText: {
import { useTheme } from '../context/ThemeContext'
      color: 'white',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    buttonSecondary: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
      borderWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    buttonSecondaryText: {
import { useTheme } from '../context/ThemeContext'
      color: colors.textPrimary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    spinner: {
import { useTheme } from '../context/ThemeContext'
      marginRight: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
  })
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const handleConfirm = () => {
import { useTheme } from '../context/ThemeContext'
    if (loading) return
import { useTheme } from '../context/ThemeContext'
    if (onConfirm) {
import { useTheme } from '../context/ThemeContext'
      onConfirm()
import { useTheme } from '../context/ThemeContext'
    }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <RNModal
import { useTheme } from '../context/ThemeContext'
      visible={isOpen}
import { useTheme } from '../context/ThemeContext'
      onRequestClose={onClose}
import { useTheme } from '../context/ThemeContext'
      transparent={true}
import { useTheme } from '../context/ThemeContext'
      animationType="slide"
import { useTheme } from '../context/ThemeContext'
    >
import { useTheme } from '../context/ThemeContext'
      <Pressable
import { useTheme } from '../context/ThemeContext'
        style={styles.overlay}
import { useTheme } from '../context/ThemeContext'
        onPress={closeOnBackdrop ? onClose : undefined}
import { useTheme } from '../context/ThemeContext'
      >
import { useTheme } from '../context/ThemeContext'
        <Pressable onPress={(e) => e.stopPropagation()}>
import { useTheme } from '../context/ThemeContext'
          <View style={styles.container}>
import { useTheme } from '../context/ThemeContext'
            {/* Header */}
import { useTheme } from '../context/ThemeContext'
            {title && (
import { useTheme } from '../context/ThemeContext'
              <View style={styles.header}>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.title}>{title}</Text>
import { useTheme } from '../context/ThemeContext'
                <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
                  style={styles.closeBtn}
import { useTheme } from '../context/ThemeContext'
                  onPress={onClose}
import { useTheme } from '../context/ThemeContext'
                  disabled={loading}
import { useTheme } from '../context/ThemeContext'
                >
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.closeBtnText}>✕</Text>
import { useTheme } from '../context/ThemeContext'
                </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            )}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
            <ScrollView
import { useTheme } from '../context/ThemeContext'
              style={styles.content}
import { useTheme } from '../context/ThemeContext'
              showsVerticalScrollIndicator={false}
import { useTheme } from '../context/ThemeContext'
            >
import { useTheme } from '../context/ThemeContext'
              {/* Error State */}
import { useTheme } from '../context/ThemeContext'
              {error && (
import { useTheme } from '../context/ThemeContext'
                <View style={styles.error}>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.errorIcon}>⚠️</Text>
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.errorMessage}>{error}</Text>
import { useTheme } from '../context/ThemeContext'
                </View>
import { useTheme } from '../context/ThemeContext'
              )}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
              {/* Content */}
import { useTheme } from '../context/ThemeContext'
              {children}
import { useTheme } from '../context/ThemeContext'
            </ScrollView>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
            {/* Footer with Actions */}
import { useTheme } from '../context/ThemeContext'
            {footer !== false && (
import { useTheme } from '../context/ThemeContext'
              <View style={styles.footer}>
import { useTheme } from '../context/ThemeContext'
                {footer ? (
import { useTheme } from '../context/ThemeContext'
                  footer
import { useTheme } from '../context/ThemeContext'
                ) : (
import { useTheme } from '../context/ThemeContext'
                  <>
import { useTheme } from '../context/ThemeContext'
                    <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
                      style={[styles.button, styles.buttonSecondary]}
import { useTheme } from '../context/ThemeContext'
                      onPress={onClose}
import { useTheme } from '../context/ThemeContext'
                      disabled={loading}
import { useTheme } from '../context/ThemeContext'
                    >
import { useTheme } from '../context/ThemeContext'
                      <Text
import { useTheme } from '../context/ThemeContext'
                        style={[styles.buttonText, styles.buttonSecondaryText]}
import { useTheme } from '../context/ThemeContext'
                      >
import { useTheme } from '../context/ThemeContext'
                        {cancelText}
import { useTheme } from '../context/ThemeContext'
                      </Text>
import { useTheme } from '../context/ThemeContext'
                    </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
                    {onConfirm && (
import { useTheme } from '../context/ThemeContext'
                      <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
                        style={[
import { useTheme } from '../context/ThemeContext'
                          styles.button,
import { useTheme } from '../context/ThemeContext'
                          styles.buttonPrimary,
import { useTheme } from '../context/ThemeContext'
                          loading && { opacity: 0.6 },
import { useTheme } from '../context/ThemeContext'
                        ]}
import { useTheme } from '../context/ThemeContext'
                        onPress={handleConfirm}
import { useTheme } from '../context/ThemeContext'
                        disabled={loading}
import { useTheme } from '../context/ThemeContext'
                      >
import { useTheme } from '../context/ThemeContext'
                        {loading && (
import { useTheme } from '../context/ThemeContext'
                          <ActivityIndicator
import { useTheme } from '../context/ThemeContext'
                            color="white"
import { useTheme } from '../context/ThemeContext'
                            style={styles.spinner}
import { useTheme } from '../context/ThemeContext'
                          />
import { useTheme } from '../context/ThemeContext'
                        )}
import { useTheme } from '../context/ThemeContext'
                        <Text style={[styles.buttonText, styles.buttonPrimaryText]}>
import { useTheme } from '../context/ThemeContext'
                          {loading ? 'Processing...' : confirmText}
import { useTheme } from '../context/ThemeContext'
                        </Text>
import { useTheme } from '../context/ThemeContext'
                      </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
                    )}
import { useTheme } from '../context/ThemeContext'
                  </>
import { useTheme } from '../context/ThemeContext'
                )}
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            )}
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        </Pressable>
import { useTheme } from '../context/ThemeContext'
      </Pressable>
import { useTheme } from '../context/ThemeContext'
    </RNModal>
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'
