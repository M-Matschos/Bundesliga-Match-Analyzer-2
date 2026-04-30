import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getColors } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import { typography } from '../theme/typography'

export default function ProfileScreen() {
  const { mode, toggleTheme } = useTheme()
  const colors = getColors(mode)
  const { user, logout } = useAuth()
  const toast = useToast()

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', onPress: () => {} },
        {
          text: 'Abmelden',
          onPress: async () => {
            try {
              await logout()
              toast.info('Erfolgreich abgemeldet')
            } catch (error) {
              toast.error('Abmeldung fehlgeschlagen')
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const handleThemeToggle = () => {
    toggleTheme()
    const newMode = mode === 'dark' ? 'light' : 'dark'
    const modeLabel = newMode === 'dark' ? 'Dark Mode' : 'Light Mode'
    toast.info(`Switched to ${modeLabel}`)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
    >
      {/* Profile Header */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.blue,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 40 }}>👤</Text>
        </View>
        <Text style={[typography.headingMD, { color: colors.text, marginBottom: 4 }]}>
          {user?.username || user?.email.split('@')[0] || 'Benutzer'}
        </Text>
        <Text style={[typography.bodySM, { color: colors.textSecond }]}>
          {user?.email}
        </Text>
      </View>

      {/* Profile Stats */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <ProfileStat colors={colors} label="Konto erstellt" value={formatDate(user?.created_at)} />
        <ProfileStat colors={colors} label="Status" value={user?.is_active ? 'Aktiv' : 'Inaktiv'} />
        <ProfileStat colors={colors} label="Benutzername" value={user?.username || '—'} />
      </View>

      {/* Preferences */}
      <Text style={[typography.labelMD, { color: colors.text, marginBottom: 12 }]}>
        Einstellungen
      </Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        <MenuItem colors={colors} label="Benachrichtigungen" icon="🔔" onPress={() => {}} />
        <Divider colors={colors} />
        <MenuItem colors={colors} label="Datenschutz" icon="🔒" onPress={() => {}} />
        <Divider colors={colors} />
        <MenuItem colors={colors} label="Hilfe & Support" icon="❓" onPress={() => {}} />
        <Divider colors={colors} />
        <ThemeToggleButton colors={colors} mode={mode} onPress={handleThemeToggle} />
      </View>

      {/* Danger Zone */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: colors.red,
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}
      >
        <Text style={[typography.labelMD, { color: colors.text }]}>
          Abmelden
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          typography.labelSM,
          {
            color: colors.textMuted,
            marginTop: 16,
            textAlign: 'center',
            fontSize: 11,
          },
        ]}
      >
        Version 1.0.0
      </Text>
    </ScrollView>
  )
}

function ProfileStat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof getColors> }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
    >
      <Text style={[typography.bodySM, { color: colors.textSecond }]}>
        {label}
      </Text>
      <Text style={[typography.bodySM, { color: colors.text, fontWeight: '600' }]}>
        {value}
      </Text>
    </View>
  )
}

function MenuItem({
  label,
  icon,
  onPress,
  colors,
}: {
  label: string
  icon: string
  onPress: () => void
  colors: ReturnType<typeof getColors>
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
      <Text style={[typography.bodySM, { color: colors.text, flex: 1 }]}>
        {label}
      </Text>
      <Text style={[typography.bodySM, { color: colors.textSecond }]}>›</Text>
    </TouchableOpacity>
  )
}

/**
 * ThemeToggleButton — Toggle between light and dark mode
 */
export function ThemeToggleButton({
  mode,
  onPress,
  colors,
}: {
  mode: 'light' | 'dark'
  onPress: () => void
  colors: ReturnType<typeof getColors>
}) {
  return (
    <TouchableOpacity
      testID="theme-toggle-button"
      accessibilityLabel="Toggle theme between light and dark mode"
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 20, marginRight: 12 }}>
        {mode === 'dark' ? '☀️' : '🌙'}
      </Text>
      <Text style={[typography.bodySM, { color: colors.text, flex: 1 }]}>
        {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </Text>
      <Text style={[typography.bodySM, { color: colors.textSecond }]}>›</Text>
    </TouchableOpacity>
  )
}

function Divider({ colors }: { colors: ReturnType<typeof getColors> }) {
  return (
    <View style={{ height: 1, backgroundColor: colors.surfaceHigh }} />
  )
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
