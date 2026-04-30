import React from 'react'
import { useTheme } from '../context/ThemeContext'
import {
import { useTheme } from '../context/ThemeContext'
  View,
import { useTheme } from '../context/ThemeContext'
  Text,
import { useTheme } from '../context/ThemeContext'
  TouchableOpacity,
import { useTheme } from '../context/ThemeContext'
  StyleSheet,
import { useTheme } from '../context/ThemeContext'
} from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { useTheme } from '../context/ThemeContext'
import { typography } from '../theme/typography'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export type StepStatus = 'pending' | 'active' | 'completed' | 'error'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export interface Step {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  label: string
import { useTheme } from '../context/ThemeContext'
  description?: string
import { useTheme } from '../context/ThemeContext'
  status?: StepStatus
import { useTheme } from '../context/ThemeContext'
  disabled?: boolean
import { useTheme } from '../context/ThemeContext'
  content?: React.ReactNode
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface StepperProps {
import { useTheme } from '../context/ThemeContext'
  steps: Step[]
import { useTheme } from '../context/ThemeContext'
  activeStep?: number
import { useTheme } from '../context/ThemeContext'
  onStepClick?: (stepIndex: number) => void
import { useTheme } from '../context/ThemeContext'
  variant?: 'default' | 'connected' | 'minimal'
import { useTheme } from '../context/ThemeContext'
  orientation?: 'horizontal' | 'vertical'
import { useTheme } from '../context/ThemeContext'
  clickable?: boolean
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export default function Stepper({
import { useTheme } from '../context/ThemeContext'
  steps,
import { useTheme } from '../context/ThemeContext'
  activeStep = 0,
import { useTheme } from '../context/ThemeContext'
  onStepClick,
import { useTheme } from '../context/ThemeContext'
  variant = 'default',
import { useTheme } from '../context/ThemeContext'
  orientation = 'vertical',
import { useTheme } from '../context/ThemeContext'
  clickable = false,
import { useTheme } from '../context/ThemeContext'
}: StepperProps) {
import { useTheme } from '../context/ThemeContext'
  const handleStepPress = (index: number) => {
import { useTheme } from '../context/ThemeContext'
    const step = steps[index]
import { useTheme } from '../context/ThemeContext'
    if (clickable && !step.disabled && onStepClick) {
import { useTheme } from '../context/ThemeContext'
      onStepClick(index)
import { useTheme } from '../context/ThemeContext'
    }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <View
import { useTheme } from '../context/ThemeContext'
      style={[
import { useTheme } from '../context/ThemeContext'
        styles.container,
import { useTheme } from '../context/ThemeContext'
        orientation === 'horizontal' && styles.containerHorizontal,
import { useTheme } from '../context/ThemeContext'
      ]}
import { useTheme } from '../context/ThemeContext'
    >
import { useTheme } from '../context/ThemeContext'
      {steps.map((step, index) => {
import { useTheme } from '../context/ThemeContext'
        const status = getStepStatus(activeStep, index, step.status)
import { useTheme } from '../context/ThemeContext'
        const isLast = index === steps.length - 1
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
        return (
import { useTheme } from '../context/ThemeContext'
          <View
import { useTheme } from '../context/ThemeContext'
            key={step.id}
import { useTheme } from '../context/ThemeContext'
            style={[
import { useTheme } from '../context/ThemeContext'
              styles.stepContainer,
import { useTheme } from '../context/ThemeContext'
              orientation === 'horizontal' && styles.stepContainerHorizontal,
import { useTheme } from '../context/ThemeContext'
              index === activeStep && styles.stepContainerActive,
import { useTheme } from '../context/ThemeContext'
            ]}
import { useTheme } from '../context/ThemeContext'
          >
import { useTheme } from '../context/ThemeContext'
            {/* Step Indicator Circle */}
import { useTheme } from '../context/ThemeContext'
            <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
              onPress={() => handleStepPress(index)}
import { useTheme } from '../context/ThemeContext'
              disabled={!clickable || step.disabled}
import { useTheme } from '../context/ThemeContext'
              style={[
import { useTheme } from '../context/ThemeContext'
                styles.stepButton,
import { useTheme } from '../context/ThemeContext'
                clickable && !step.disabled && styles.stepButtonClickable,
import { useTheme } from '../context/ThemeContext'
              ]}
import { useTheme } from '../context/ThemeContext'
              activeOpacity={0.7}
import { useTheme } from '../context/ThemeContext'
            >
import { useTheme } from '../context/ThemeContext'
              <View
import { useTheme } from '../context/ThemeContext'
                style={[
import { useTheme } from '../context/ThemeContext'
                  styles.stepIndicator,
import { useTheme } from '../context/ThemeContext'
                  getIndicatorStyle(status, step.disabled),
import { useTheme } from '../context/ThemeContext'
                ]}
import { useTheme } from '../context/ThemeContext'
              >
import { useTheme } from '../context/ThemeContext'
                {getStepIcon(status, index + 1)}
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
            {/* Step Label + Description */}
import { useTheme } from '../context/ThemeContext'
            <View
import { useTheme } from '../context/ThemeContext'
              style={[
import { useTheme } from '../context/ThemeContext'
                styles.stepLabel,
import { useTheme } from '../context/ThemeContext'
                orientation === 'horizontal' && styles.stepLabelHorizontal,
import { useTheme } from '../context/ThemeContext'
              ]}
import { useTheme } from '../context/ThemeContext'
            >
import { useTheme } from '../context/ThemeContext'
              <Text
import { useTheme } from '../context/ThemeContext'
                style={[
import { useTheme } from '../context/ThemeContext'
                  typography.labelMD,
import { useTheme } from '../context/ThemeContext'
                  {
import { useTheme } from '../context/ThemeContext'
                    color:
import { useTheme } from '../context/ThemeContext'
                      status === 'pending'
import { useTheme } from '../context/ThemeContext'
                        ? colors.textSecond
import { useTheme } from '../context/ThemeContext'
                        : colors.text,
import { useTheme } from '../context/ThemeContext'
                    fontWeight: status === 'active' ? '700' : '600',
import { useTheme } from '../context/ThemeContext'
                  },
import { useTheme } from '../context/ThemeContext'
                ]}
import { useTheme } from '../context/ThemeContext'
              >
import { useTheme } from '../context/ThemeContext'
                {step.label}
import { useTheme } from '../context/ThemeContext'
              </Text>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
              {step.description && (
import { useTheme } from '../context/ThemeContext'
                <Text
import { useTheme } from '../context/ThemeContext'
                  style={[
import { useTheme } from '../context/ThemeContext'
                    typography.bodySM,
import { useTheme } from '../context/ThemeContext'
                    { color: colors.textMuted, marginTop: SPACING.xs },
import { useTheme } from '../context/ThemeContext'
                  ]}
import { useTheme } from '../context/ThemeContext'
                >
import { useTheme } from '../context/ThemeContext'
                  {step.description}
import { useTheme } from '../context/ThemeContext'
                </Text>
import { useTheme } from '../context/ThemeContext'
              )}
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
            {/* Connector (between steps) */}
import { useTheme } from '../context/ThemeContext'
            {!isLast && variant !== 'minimal' && (
import { useTheme } from '../context/ThemeContext'
              <View
import { useTheme } from '../context/ThemeContext'
                style={[
import { useTheme } from '../context/ThemeContext'
                  styles.connector,
import { useTheme } from '../context/ThemeContext'
                  orientation === 'horizontal'
import { useTheme } from '../context/ThemeContext'
                    ? styles.connectorHorizontal
import { useTheme } from '../context/ThemeContext'
                    : styles.connectorVertical,
import { useTheme } from '../context/ThemeContext'
                  getConnectorStyle(status),
import { useTheme } from '../context/ThemeContext'
                ]}
import { useTheme } from '../context/ThemeContext'
              />
import { useTheme } from '../context/ThemeContext'
            )}
import { useTheme } from '../context/ThemeContext'
          </View>
import { useTheme } from '../context/ThemeContext'
        )
import { useTheme } from '../context/ThemeContext'
      })}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Active Step Content */}
import { useTheme } from '../context/ThemeContext'
      {steps[activeStep]?.content && (
import { useTheme } from '../context/ThemeContext'
        <View style={styles.content}>{steps[activeStep].content}</View>
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
function getStepStatus(
import { useTheme } from '../context/ThemeContext'
  activeStep: number,
import { useTheme } from '../context/ThemeContext'
  stepIndex: number,
import { useTheme } from '../context/ThemeContext'
  customStatus?: StepStatus
import { useTheme } from '../context/ThemeContext'
): StepStatus {
import { useTheme } from '../context/ThemeContext'
  if (customStatus) return customStatus
import { useTheme } from '../context/ThemeContext'
  if (stepIndex < activeStep) return 'completed'
import { useTheme } from '../context/ThemeContext'
  if (stepIndex === activeStep) return 'active'
import { useTheme } from '../context/ThemeContext'
  return 'pending'
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
function getIndicatorStyle(status: StepStatus, disabled?: boolean) {
import { useTheme } from '../context/ThemeContext'
  const baseStyle = {
import { useTheme } from '../context/ThemeContext'
    width: 40,
import { useTheme } from '../context/ThemeContext'
    height: 40,
import { useTheme } from '../context/ThemeContext'
    borderRadius: 20,
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'center' as const,
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center' as const,
import { useTheme } from '../context/ThemeContext'
    borderWidth: 2,
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const statusStyles = {
import { useTheme } from '../context/ThemeContext'
    pending: {
import { useTheme } from '../context/ThemeContext'
      ...baseStyle,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    active: {
import { useTheme } from '../context/ThemeContext'
      ...baseStyle,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.blue,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.blue,
import { useTheme } from '../context/ThemeContext'
      shadowColor: colors.blue,
import { useTheme } from '../context/ThemeContext'
      shadowOffset: { width: 0, height: 0 },
import { useTheme } from '../context/ThemeContext'
      shadowOpacity: 0.3,
import { useTheme } from '../context/ThemeContext'
      shadowRadius: 8,
import { useTheme } from '../context/ThemeContext'
      elevation: 4,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    completed: {
import { useTheme } from '../context/ThemeContext'
      ...baseStyle,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.green,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.green,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    error: {
import { useTheme } from '../context/ThemeContext'
      ...baseStyle,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.red,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.red,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const style = statusStyles[status]
import { useTheme } from '../context/ThemeContext'
  if (disabled) {
import { useTheme } from '../context/ThemeContext'
    return { ...style, opacity: 0.5 }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'
  return style
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
function getStepIcon(status: StepStatus, stepNumber: number) {
import { useTheme } from '../context/ThemeContext'
  switch (status) {
import { useTheme } from '../context/ThemeContext'
    case 'completed':
import { useTheme } from '../context/ThemeContext'
      return (
import { useTheme } from '../context/ThemeContext'
        <Text
import { useTheme } from '../context/ThemeContext'
          style={{
import { useTheme } from '../context/ThemeContext'
            fontSize: 22,
import { useTheme } from '../context/ThemeContext'
            fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
            color: 'white',
import { useTheme } from '../context/ThemeContext'
          }}
import { useTheme } from '../context/ThemeContext'
        >
import { useTheme } from '../context/ThemeContext'
          ✓
import { useTheme } from '../context/ThemeContext'
        </Text>
import { useTheme } from '../context/ThemeContext'
      )
import { useTheme } from '../context/ThemeContext'
    case 'error':
import { useTheme } from '../context/ThemeContext'
      return (
import { useTheme } from '../context/ThemeContext'
        <Text
import { useTheme } from '../context/ThemeContext'
          style={{
import { useTheme } from '../context/ThemeContext'
            fontSize: 20,
import { useTheme } from '../context/ThemeContext'
            fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
            color: 'white',
import { useTheme } from '../context/ThemeContext'
          }}
import { useTheme } from '../context/ThemeContext'
        >
import { useTheme } from '../context/ThemeContext'
          !
import { useTheme } from '../context/ThemeContext'
        </Text>
import { useTheme } from '../context/ThemeContext'
      )
import { useTheme } from '../context/ThemeContext'
    case 'active':
import { useTheme } from '../context/ThemeContext'
      return (
import { useTheme } from '../context/ThemeContext'
        <Text
import { useTheme } from '../context/ThemeContext'
          style={{
import { useTheme } from '../context/ThemeContext'
            fontSize: 18,
import { useTheme } from '../context/ThemeContext'
            fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
            color: 'white',
import { useTheme } from '../context/ThemeContext'
          }}
import { useTheme } from '../context/ThemeContext'
        >
import { useTheme } from '../context/ThemeContext'
          {stepNumber}
import { useTheme } from '../context/ThemeContext'
        </Text>
import { useTheme } from '../context/ThemeContext'
      )
import { useTheme } from '../context/ThemeContext'
    case 'pending':
import { useTheme } from '../context/ThemeContext'
    default:
import { useTheme } from '../context/ThemeContext'
      return (
import { useTheme } from '../context/ThemeContext'
        <Text
import { useTheme } from '../context/ThemeContext'
          style={{
import { useTheme } from '../context/ThemeContext'
            fontSize: 18,
import { useTheme } from '../context/ThemeContext'
            fontWeight: '700',
import { useTheme } from '../context/ThemeContext'
            color: colors.textSecond,
import { useTheme } from '../context/ThemeContext'
          }}
import { useTheme } from '../context/ThemeContext'
        >
import { useTheme } from '../context/ThemeContext'
          {stepNumber}
import { useTheme } from '../context/ThemeContext'
        </Text>
import { useTheme } from '../context/ThemeContext'
      )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
function getConnectorStyle(status: StepStatus) {
import { useTheme } from '../context/ThemeContext'
  const baseStyle = {
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.border,
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  if (status === 'completed' || status === 'active') {
import { useTheme } from '../context/ThemeContext'
    return {
import { useTheme } from '../context/ThemeContext'
      ...baseStyle,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.green,
import { useTheme } from '../context/ThemeContext'
    }
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'
  return baseStyle
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
const styles = StyleSheet.create({
import { useTheme } from '../context/ThemeContext'
  container: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'column',
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    padding: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    backgroundColor: colors.background,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  containerHorizontal: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'flex-start',
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepContainer: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'flex-start',
import { useTheme } from '../context/ThemeContext'
    gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepContainerHorizontal: {
import { useTheme } from '../context/ThemeContext'
    flexDirection: 'column',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepContainerActive: {
import { useTheme } from '../context/ThemeContext'
    // Highlight active step visually
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepButton: {
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepButtonClickable: {
import { useTheme } from '../context/ThemeContext'
    cursor: 'pointer',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepIndicator: {
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepLabel: {
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
    justifyContent: 'flex-start',
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  stepLabelHorizontal: {
import { useTheme } from '../context/ThemeContext'
    alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  connector: {
import { useTheme } from '../context/ThemeContext'
    position: 'absolute',
import { useTheme } from '../context/ThemeContext'
    left: 19, // (40 - 2) / 2 for vertical line positioning
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  connectorVertical: {
import { useTheme } from '../context/ThemeContext'
    width: 2,
import { useTheme } from '../context/ThemeContext'
    height: 60,
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.md,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  connectorHorizontal: {
import { useTheme } from '../context/ThemeContext'
    height: 2,
import { useTheme } from '../context/ThemeContext'
    flex: 1,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
  content: {
import { useTheme } from '../context/ThemeContext'
    marginTop: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    paddingTop: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
    borderTopWidth: 1,
import { useTheme } from '../context/ThemeContext'
    borderTopColor: colors.border,
import { useTheme } from '../context/ThemeContext'
  },
import { useTheme } from '../context/ThemeContext'
})
import { useTheme } from '../context/ThemeContext'
