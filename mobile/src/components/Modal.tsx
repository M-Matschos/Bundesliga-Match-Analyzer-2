import React, { useMemo } from 'react'
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { useThemeColors } from '../hooks/useTheme'

/**
 * Modal Component (React Native) — Bottom sheet style modal
 *
 * Slides up from bottom (mobile convention)
 * Variants: confirmation, detail, form, alert
 * States: closed, open, loading, error
 */

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title?: string
  children?: React.ReactNode
  confirmText?: string
  cancelText?: string
  loading?: boolean
  error?: string
  footer?: React.ReactNode | boolean
  closeOnBackdrop?: boolean
}

export default function Modal({
  isOpen = false,
  onClose = () => {},
  onConfirm = null,
  title = '',
  children = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  error = null,
  footer = null,
  closeOnBackdrop = true,
}: ModalProps) {
  const colors = useThemeColors()
  const styles = useMemo(() => createStyles(colors), [colors])

  const handleConfirm = () => {
    if (loading) return
    if (onConfirm) {
      onConfirm()
    }
  }

  return (
    <RNModal
      visible={isOpen}
      onRequestClose={onClose}
      transparent={true}
      animationType="slide"
    >
      <Pressable
        style={styles.overlay}
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            {/* Header */}
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Error State */}
              {error && (
                <View style={styles.error}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              )}

              {/* Content */}
              {children}
            </ScrollView>

            {/* Footer with Actions */}
            {footer !== false && (
              <View style={styles.footer}>
                {footer ? (
                  footer
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonSecondary]}
                      onPress={onClose}
                      disabled={loading}
                    >
                      <Text
                        style={[styles.buttonText, styles.buttonSecondaryText]}
                      >
                        {cancelText}
                      </Text>
                    </TouchableOpacity>

                    {onConfirm && (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.buttonPrimary,
                          loading && { opacity: 0.6 },
                        ]}
                        onPress={handleConfirm}
                        disabled={loading}
                      >
                        {loading && (
                          <ActivityIndicator
                            color="white"
                            style={styles.spinner}
                          />
                        )}
                        <Text style={[styles.buttonText, styles.buttonPrimaryText]}>
                          {loading ? 'Processing...' : confirmText}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  )
}

const createStyles = (colors: ReturnType<typeof getColors>) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingBottom: SPACING.lg,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 24,
    color: colors.textSecond,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  error: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: colors.red + '20',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: colors.red,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  errorMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.red,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryText: {
    color: '#FFF',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    color: colors.text,
  },
  spinner: {
    marginRight: SPACING.xs,
  },
})
