import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { colors, SPACING } from '../theme/colors'
import { typography } from '../theme/typography'

export type StepStatus = 'pending' | 'active' | 'completed' | 'error'

export interface Step {
  id: string
  label: string
  description?: string
  status?: StepStatus
  disabled?: boolean
  content?: React.ReactNode
}

interface StepperProps {
  steps: Step[]
  activeStep?: number
  onStepClick?: (stepIndex: number) => void
  variant?: 'default' | 'connected' | 'minimal'
  orientation?: 'horizontal' | 'vertical'
  clickable?: boolean
}

export default function Stepper({
  steps,
  activeStep = 0,
  onStepClick,
  variant = 'default',
  orientation = 'vertical',
  clickable = false,
}: StepperProps) {
  const handleStepPress = (index: number) => {
    const step = steps[index]
    if (clickable && !step.disabled && onStepClick) {
      onStepClick(index)
    }
  }

  return (
    <View
      style={[
        styles.container,
        orientation === 'horizontal' && styles.containerHorizontal,
      ]}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(activeStep, index, step.status)
        const isLast = index === steps.length - 1

        return (
          <View
            key={step.id}
            style={[
              styles.stepContainer,
              orientation === 'horizontal' && styles.stepContainerHorizontal,
              index === activeStep && styles.stepContainerActive,
            ]}
          >
            {/* Step Indicator Circle */}
            <TouchableOpacity
              onPress={() => handleStepPress(index)}
              disabled={!clickable || step.disabled}
              style={[
                styles.stepButton,
                clickable && !step.disabled && styles.stepButtonClickable,
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepIndicator,
                  getIndicatorStyle(status, step.disabled),
                ]}
              >
                {getStepIcon(status, index + 1)}
              </View>
            </TouchableOpacity>

            {/* Step Label + Description */}
            <View
              style={[
                styles.stepLabel,
                orientation === 'horizontal' && styles.stepLabelHorizontal,
              ]}
            >
              <Text
                style={[
                  typography.labelMD,
                  {
                    color:
                      status === 'pending'
                        ? colors.textSecond
                        : colors.text,
                    fontWeight: status === 'active' ? '700' : '600',
                  },
                ]}
              >
                {step.label}
              </Text>

              {step.description && (
                <Text
                  style={[
                    typography.bodySM,
                    { color: colors.textMuted, marginTop: SPACING.xs },
                  ]}
                >
                  {step.description}
                </Text>
              )}
            </View>

            {/* Connector (between steps) */}
            {!isLast && variant !== 'minimal' && (
              <View
                style={[
                  styles.connector,
                  orientation === 'horizontal'
                    ? styles.connectorHorizontal
                    : styles.connectorVertical,
                  getConnectorStyle(status),
                ]}
              />
            )}
          </View>
        )
      })}

      {/* Active Step Content */}
      {steps[activeStep]?.content && (
        <View style={styles.content}>{steps[activeStep].content}</View>
      )}
    </View>
  )
}

function getStepStatus(
  activeStep: number,
  stepIndex: number,
  customStatus?: StepStatus
): StepStatus {
  if (customStatus) return customStatus
  if (stepIndex < activeStep) return 'completed'
  if (stepIndex === activeStep) return 'active'
  return 'pending'
}

function getIndicatorStyle(status: StepStatus, disabled?: boolean) {
  const baseStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
  }

  const statusStyles = {
    pending: {
      ...baseStyle,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    active: {
      ...baseStyle,
      backgroundColor: colors.blue,
      borderColor: colors.blue,
      shadowColor: colors.blue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    completed: {
      ...baseStyle,
      backgroundColor: colors.green,
      borderColor: colors.green,
    },
    error: {
      ...baseStyle,
      backgroundColor: colors.red,
      borderColor: colors.red,
    },
  }

  const style = statusStyles[status]
  if (disabled) {
    return { ...style, opacity: 0.5 }
  }
  return style
}

function getStepIcon(status: StepStatus, stepNumber: number) {
  switch (status) {
    case 'completed':
      return (
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: 'white',
          }}
        >
          ✓
        </Text>
      )
    case 'error':
      return (
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: 'white',
          }}
        >
          !
        </Text>
      )
    case 'active':
      return (
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: 'white',
          }}
        >
          {stepNumber}
        </Text>
      )
    case 'pending':
    default:
      return (
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.textSecond,
          }}
        >
          {stepNumber}
        </Text>
      )
  }
}

function getConnectorStyle(status: StepStatus) {
  const baseStyle = {
    backgroundColor: colors.border,
  }

  if (status === 'completed' || status === 'active') {
    return {
      ...baseStyle,
      backgroundColor: colors.green,
    }
  }
  return baseStyle
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: colors.background,
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    flex: 1,
  },
  stepContainerHorizontal: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  stepContainerActive: {
    // Highlight active step visually
  },
  stepButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonClickable: {
    cursor: 'pointer',
  },
  stepIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  stepLabelHorizontal: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  connector: {
    position: 'absolute',
    left: 19, // (40 - 2) / 2 for vertical line positioning
  },
  connectorVertical: {
    width: 2,
    height: 60,
    marginTop: SPACING.md,
  },
  connectorHorizontal: {
    height: 2,
    flex: 1,
  },
  content: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
