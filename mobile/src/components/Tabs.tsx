import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
import { useTheme } from '../context/ThemeContext'
  View,
import { useTheme } from '../context/ThemeContext'
  Text,
import { useTheme } from '../context/ThemeContext'
  TouchableOpacity,
import { useTheme } from '../context/ThemeContext'
  ScrollView,
import { useTheme } from '../context/ThemeContext'
  StyleSheet,
import { useTheme } from '../context/ThemeContext'
  Animated,
import { useTheme } from '../context/ThemeContext'
} from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import { typography } from '../theme/typography'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export interface TabItem {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  label: string
import { useTheme } from '../context/ThemeContext'
  icon?: string
import { useTheme } from '../context/ThemeContext'
  badge?: string | number
import { useTheme } from '../context/ThemeContext'
  content?: React.ReactNode
import { useTheme } from '../context/ThemeContext'
  disabled?: boolean
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface TabsProps {
import { useTheme } from '../context/ThemeContext'
  tabs: TabItem[]
import { useTheme } from '../context/ThemeContext'
  defaultActiveId?: string
import { useTheme } from '../context/ThemeContext'
  onTabChange?: (tabId: string) => void
import { useTheme } from '../context/ThemeContext'
  variant?: 'default' | 'pills' | 'underline'
import { useTheme } from '../context/ThemeContext'
  fullWidth?: boolean
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export default function Tabs({
import { useTheme } from '../context/ThemeContext'
  tabs,
import { useTheme } from '../context/ThemeContext'
  defaultActiveId,
import { useTheme } from '../context/ThemeContext'
  onTabChange,
import { useTheme } from '../context/ThemeContext'
  variant = 'default',
import { useTheme } from '../context/ThemeContext'
  fullWidth = false,
import { useTheme } from '../context/ThemeContext'
}: TabsProps) {
import { useTheme } from '../context/ThemeContext'
  const [activeId, setActiveId] = useState(
import { useTheme } from '../context/ThemeContext'
    defaultActiveId || tabs[0]?.id || null
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const handleTabPress = (tabId: string) => {
import { useTheme } from '../context/ThemeContext'
    const tab = tabs.find(t => t.id === tabId)
import { useTheme } from '../context/ThemeContext'
    if (tab && !tab.disabled) {
import { useTheme } from '../context/ThemeContext'
      setActiveId(tabId)
import { useTheme } from '../context/ThemeContext'
      onTabChange?.(tabId)
import { useTheme } from '../context/ThemeContext'
    }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const activeTab = tabs.find(t => t.id === activeId)
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <View style={styles.container}>
import { useTheme } from '../context/ThemeContext'
      {/* Tab Bar */}
import { useTheme } from '../context/ThemeContext'
      <ScrollView
import { useTheme } from '../context/ThemeContext'
        horizontal
import { useTheme } from '../context/ThemeContext'
        showsHorizontalScrollIndicator={false}
import { useTheme } from '../context/ThemeContext'
        style={styles.tabBar}
import { useTheme } from '../context/ThemeContext'
        contentContainerStyle={[
import { useTheme } from '../context/ThemeContext'
          fullWidth && { flex: 1, justifyContent: 'space-around' },
import { useTheme } from '../context/ThemeContext'
        ]}
import { useTheme } from '../context/ThemeContext'
      >
import { useTheme } from '../context/ThemeContext'
        {tabs.map(tab => (
import { useTheme } from '../context/ThemeContext'
          <TabButton
import { useTheme } from '../context/ThemeContext'
            key={tab.id}
import { useTheme } from '../context/ThemeContext'
            tab={tab}
import { useTheme } from '../context/ThemeContext'
            isActive={tab.id === activeId}
import { useTheme } from '../context/ThemeContext'
            variant={variant}
import { useTheme } from '../context/ThemeContext'
            onPress={() => handleTabPress(tab.id)}
import { useTheme } from '../context/ThemeContext'
            fullWidth={fullWidth}
import { useTheme } from '../context/ThemeContext'
          />
import { useTheme } from '../context/ThemeContext'
        ))}
import { useTheme } from '../context/ThemeContext'
      </ScrollView>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Tab Content */}
import { useTheme } from '../context/ThemeContext'
      {activeTab?.content && (
import { useTheme } from '../context/ThemeContext'
        <Animated.View style={styles.content}>{activeTab.content}</Animated.View>
import { useTheme } from '../context/ThemeContext'
      )}
import { useTheme } from '../context/ThemeContext'
    </View>
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface TabButtonProps {
import { useTheme } from '../context/ThemeContext'
  tab: TabItem
import { useTheme } from '../context/ThemeContext'
  isActive: boolean
import { useTheme } from '../context/ThemeContext'
  variant: 'default' | 'pills' | 'underline'
import { useTheme } from '../context/ThemeContext'
  onPress: () => void
import { useTheme } from '../context/ThemeContext'
  fullWidth: boolean
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
function TabButton({
import { useTheme } from '../context/ThemeContext'
  tab,
import { useTheme } from '../context/ThemeContext'
  isActive,
import { useTheme } from '../context/ThemeContext'
  variant,
import { useTheme } from '../context/ThemeContext'
  onPress,
import { useTheme } from '../context/ThemeContext'
  fullWidth,
import { useTheme } from '../context/ThemeContext'
}: TabButtonProps) {
import { useTheme } from '../context/ThemeContext'
  const styles = getTabButtonStyles(variant, isActive, tab.disabled)
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
      onPress={onPress}
import { useTheme } from '../context/ThemeContext'
      disabled={tab.disabled}
import { useTheme } from '../context/ThemeContext'
      style={[
import { useTheme } from '../context/ThemeContext'
        styles.button,
import { useTheme } from '../context/ThemeContext'
        fullWidth && { flex: 1, justifyContent: 'center' },
import { useTheme } from '../context/ThemeContext'
      ]}
import { useTheme } from '../context/ThemeContext'
      activeOpacity={0.7}
import { useTheme } from '../context/ThemeContext'
    >
import { useTheme } from '../context/ThemeContext'
      {/* Icon */}
import { useTheme } from '../context/ThemeContext'
      {tab.icon && (
import { useTheme } from '../context/ThemeContext'
        <Text
import { useTheme } from '../context/ThemeContext'
          style={[
import { useTheme } from '../context/ThemeContext'
            styles.icon,
import { useTheme } from '../context/ThemeContext'
            { color: isActive ? styles.button.color : colors.textSecond },
import { useTheme } from '../context/ThemeContext'
          ]}
import { useTheme } from '../context/ThemeContext'
        >
import { useTheme } from '../context/ThemeContext'
          {tab.icon}
import { useTheme } from '../context/ThemeContext'
        </Text>
import { useTheme } from '../context/ThemeContext'
      )}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Label */}
import { useTheme } from '../context/ThemeContext'
      <Text
import { useTheme } from '../context/ThemeContext'
        style={[
import { useTheme } from '../context/ThemeContext'
          typography.labelMD,
import { useTheme } from '../context/ThemeContext'
          {
import { useTheme } from '../context/ThemeContext'
            color: isActive ? styles.button.color : colors.textSecond,
import { useTheme } from '../context/ThemeContext'
            fontWeight: isActive ? '600' : '500',
import { useTheme } from '../context/ThemeContext'
          },
import { useTheme } from '../context/ThemeContext'
        ]}
import { useTheme } from '../context/ThemeContext'
      >
import { useTheme } from '../context/ThemeContext'
        {tab.label}
import { useTheme } from '../context/ThemeContext'
      </Text>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Badge */}
import { useTheme } from '../context/ThemeContext'
      {tab.badge && (
import { useTheme } from '../context/ThemeContext'
        <View style={styles.badge}>
import { useTheme } from '../context/ThemeContext'
          <Text
import { useTheme } from '../context/ThemeContext'
            style={[
import { useTheme } from '../context/ThemeContext'
              typography.labelXS,
import { useTheme } from '../context/ThemeContext'
              {
import { useTheme } from '../context/ThemeContext'
                color: 'white',
import { useTheme } from '../context/ThemeContext'
                fontWeight: '600',
import { useTheme } from '../context/ThemeContext'
              },
import { useTheme } from '../context/ThemeContext'
            ]}
import { useTheme } from '../context/ThemeContext'
          >
import { useTheme } from '../context/ThemeContext'
            {tab.badge}
import { useTheme } from '../context/ThemeContext'
          </Text>
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      )}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Active Indicator (variant-specific) */}
import { useTheme } from '../context/ThemeContext'
      {isActive && variant === 'underline' && (
import { useTheme } from '../context/ThemeContext'
        <View
import { useTheme } from '../context/ThemeContext'
          style={{
import { useTheme } from '../context/ThemeContext'
            height: 3,
import { useTheme } from '../context/ThemeContext'
            backgroundColor: colors.blue,
import { useTheme } from '../context/ThemeContext'
            position: 'absolute',
import { useTheme } from '../context/ThemeContext'
            bottom: 0,
import { useTheme } from '../context/ThemeContext'
            left: 0,
import { useTheme } from '../context/ThemeContext'
            right: 0,
import { useTheme } from '../context/ThemeContext'
            borderRadius: RADIUS.sm,
import { useTheme } from '../context/ThemeContext'
          }}
import { useTheme } from '../context/ThemeContext'
        />
import { useTheme } from '../context/ThemeContext'
      )}
import { useTheme } from '../context/ThemeContext'
    </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
function getTabButtonStyles(
import { useTheme } from '../context/ThemeContext'
  variant: 'default' | 'pills' | 'underline',
import { useTheme } from '../context/ThemeContext'
  isActive: boolean,
import { useTheme } from '../context/ThemeContext'
  disabled?: boolean
import { useTheme } from '../context/ThemeContext'
) {
import { useTheme } from '../context/ThemeContext'
  const baseButton = {
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    borderRadius: variant === 'pills' ? RADIUS.full : RADIUS.md,
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row' as const,
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center' as const,
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
    opacity: disabled ? 0.5 : 1,
import { useTheme } from '../context/ThemeContext'
    color: isActive ? colors.blue : colors.textSecond,
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const variantStyles = {
import { useTheme } from '../context/ThemeContext'
    default: {
import { useTheme } from '../context/ThemeContext'
      button: {
import { useTheme } from '../context/ThemeContext'
        ...baseButton,
import { useTheme } from '../context/ThemeContext'
        backgroundColor: 'transparent',
import { useTheme } from '../context/ThemeContext'
        borderBottomWidth: isActive ? 3 : 0,
import { useTheme } from '../context/ThemeContext'
        borderBottomColor: colors.blue,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      icon: { fontSize: 20, fontWeight: '600' },
import { useTheme } from '../context/ThemeContext'
      badge: {
import { useTheme } from '../context/ThemeContext'
        backgroundColor: colors.red,
import { useTheme } from '../context/ThemeContext'
        paddingHorizontal: 6,
import { useTheme } from '../context/ThemeContext'
        paddingVertical: 2,
import { useTheme } from '../context/ThemeContext'
        borderRadius: RADIUS.full,
import { useTheme } from '../context/ThemeContext'
        minWidth: 20,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    pills: {
import { useTheme } from '../context/ThemeContext'
      button: {
import { useTheme } from '../context/ThemeContext'
        ...baseButton,
import { useTheme } from '../context/ThemeContext'
        backgroundColor: isActive ? colors.blue : colors.surface,
import { useTheme } from '../context/ThemeContext'
        color: isActive ? 'white' : colors.textSecond,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      icon: { fontSize: 20, fontWeight: '600' },
import { useTheme } from '../context/ThemeContext'
      badge: {
import { useTheme } from '../context/ThemeContext'
        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.red,
import { useTheme } from '../context/ThemeContext'
        paddingHorizontal: 6,
import { useTheme } from '../context/ThemeContext'
        paddingVertical: 2,
import { useTheme } from '../context/ThemeContext'
        borderRadius: RADIUS.full,
import { useTheme } from '../context/ThemeContext'
        minWidth: 20,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    underline: {
import { useTheme } from '../context/ThemeContext'
      button: {
import { useTheme } from '../context/ThemeContext'
        ...baseButton,
import { useTheme } from '../context/ThemeContext'
        backgroundColor: 'transparent',
import { useTheme } from '../context/ThemeContext'
        paddingBottom: SPACING.md + 3, // Extra space for indicator
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
      icon: { fontSize: 20, fontWeight: '600' },
import { useTheme } from '../context/ThemeContext'
      badge: {
import { useTheme } from '../context/ThemeContext'
        backgroundColor: isActive ? colors.blue : colors.red,
import { useTheme } from '../context/ThemeContext'
        paddingHorizontal: 6,
import { useTheme } from '../context/ThemeContext'
        paddingVertical: 2,
import { useTheme } from '../context/ThemeContext'
        borderRadius: RADIUS.full,
import { useTheme } from '../context/ThemeContext'
        minWidth: 20,
import { useTheme } from '../context/ThemeContext'
      },
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return variantStyles[variant]
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
const styles = StyleSheet.create({
import { useTheme } from '../context/ThemeContext'
  container: {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  tabBar: {
import { useTheme } from '../context/ThemeContext'
    borderBottomWidth: 1,
import { useTheme } from '../context/ThemeContext'
    borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.background,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  content: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.background,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
})
import { useTheme } from '../context/ThemeContext'
