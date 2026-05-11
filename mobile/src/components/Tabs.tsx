import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native'
import { colors, SPACING, RADIUS } from '../theme/colors'
import { typography } from '../theme/typography'

export interface TabItem {
  id: string
  label: string
  icon?: string
  badge?: string | number
  content?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  defaultActiveId?: string
  onTabChange?: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  fullWidth?: boolean
}

export default function Tabs({
  tabs,
  defaultActiveId,
  onTabChange,
  variant = 'default',
  fullWidth = false,
}: TabsProps) {
  const [activeId, setActiveId] = useState(
    defaultActiveId || tabs[0]?.id || null
  )

  const handleTabPress = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab && !tab.disabled) {
      setActiveId(tabId)
      onTabChange?.(tabId)
    }
  }

  const activeTab = tabs.find(t => t.id === activeId)

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={[
          fullWidth && { flex: 1, justifyContent: 'space-around' },
        ]}
      >
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            variant={variant}
            onPress={() => handleTabPress(tab.id)}
            fullWidth={fullWidth}
          />
        ))}
      </ScrollView>

      {/* Tab Content */}
      {activeTab?.content && (
        <Animated.View style={styles.content}>{activeTab.content}</Animated.View>
      )}
    </View>
  )
}

interface TabButtonProps {
  tab: TabItem
  isActive: boolean
  variant: 'default' | 'pills' | 'underline'
  onPress: () => void
  fullWidth: boolean
}

function TabButton({
  tab,
  isActive,
  variant,
  onPress,
  fullWidth,
}: TabButtonProps) {
  const tabStyles = getTabButtonStyles(variant, isActive, tab.disabled)

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={tab.disabled}
      style={[
        tabStyles.button,
        fullWidth && { flex: 1, justifyContent: 'center' },
      ]}
      activeOpacity={0.7}
    >
      {/* Icon */}
      {tab.icon && (
        <Text
          style={[
            tabStyles.icon,
            { color: isActive ? colors.blue : colors.textSecond },
          ]}
        >
          {tab.icon}
        </Text>
      )}

      {/* Label */}
      <Text
        style={[
          typography.labelMD,
          {
            color: isActive ? colors.blue : colors.textSecond,
            fontWeight: isActive ? '600' : '500',
          },
        ]}
      >
        {tab.label}
      </Text>

      {/* Badge */}
      {tab.badge && (
        <View style={tabStyles.badge}>
          <Text
            style={[
              typography.labelXS,
              {
                color: 'white',
                fontWeight: '600',
              },
            ]}
          >
            {tab.badge}
          </Text>
        </View>
      )}

      {/* Active Indicator (variant-specific) */}
      {isActive && variant === 'underline' && (
        <View
          style={{
            height: 3,
            backgroundColor: colors.blue,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: RADIUS.sm,
          }}
        />
      )}
    </TouchableOpacity>
  )
}

function getTabButtonStyles(
  variant: 'default' | 'pills' | 'underline',
  isActive: boolean,
  disabled?: boolean
) {
  const baseButton = {
    padding: SPACING.md,
    borderRadius: variant === 'pills' ? RADIUS.full : RADIUS.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: SPACING.sm,
    opacity: disabled ? 0.5 : 1,
  }

  const variantStyles = {
    default: {
      button: {
        ...baseButton,
        backgroundColor: 'transparent',
        borderBottomWidth: isActive ? 3 : 0,
        borderBottomColor: colors.blue,
      },
      icon: { fontSize: 20, fontWeight: '600' },
      badge: {
        backgroundColor: colors.red,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        minWidth: 20,
      },
    },
    pills: {
      button: {
        ...baseButton,
        backgroundColor: isActive ? colors.blue : colors.surface,
      },
      icon: { fontSize: 20, fontWeight: '600' },
      badge: {
        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.red,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        minWidth: 20,
      },
    },
    underline: {
      button: {
        ...baseButton,
        backgroundColor: 'transparent',
        paddingBottom: SPACING.md + 3, // Extra space for indicator
      },
      icon: { fontSize: 20, fontWeight: '600' },
      badge: {
        backgroundColor: isActive ? colors.blue : colors.red,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        minWidth: 20,
      },
    },
  }

  return variantStyles[variant]
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
})
