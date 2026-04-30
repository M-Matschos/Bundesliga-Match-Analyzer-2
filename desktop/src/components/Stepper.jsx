import React, { useState } from 'react'
import './Stepper.css'

/**
 * Stepper Component — Multi-step progress indicator
 *
 * Example: Step 1: League Selection → Step 2: Parameters → Step 3: Results
 * Features: numbered steps, status (pending/active/completed/error), click navigation
 */

export default function Stepper({
  steps = [],
  activeStep = 0,
  onStepClick = null,
  variant = 'default', // 'default' | 'connected' | 'minimal'
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  clickable = false,
  className = '',
}) {
  const [internalActive, setInternalActive] = useState(activeStep)
  const active = internalActive

  const handleStepClick = (stepIndex) => {
    if (!clickable || steps[stepIndex].disabled) return

    setInternalActive(stepIndex)
    if (onStepClick) {
      onStepClick(stepIndex)
    }
  }

  const stepperClass = [
    'Stepper',
    `Stepper--${variant}`,
    `Stepper--${orientation}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`${stepperClass} ${className}`} role="group" aria-label="Step navigation">
      <div className="Stepper__container">
        {steps.map((step, index) => {
          const isCompleted = index < active
          const isActive = index === active
          const isError = step.status === 'error'
          const isDisabled = step.disabled

          const stepClass = [
            'Stepper__step',
            `Stepper__step--${step.status || 'pending'}`,
            isCompleted && 'Stepper__step--completed',
            isActive && 'Stepper__step--active',
            isError && 'Stepper__step--error',
            isDisabled && 'Stepper__step--disabled',
          ]
            .filter(Boolean)
            .join(' ')

          const stepButtonClass = [
            'Stepper__step-button',
            clickable && !isDisabled && 'Stepper__step-button--clickable',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <React.Fragment key={step.id || index}>
              {/* Step circle + label */}
              <div className={stepClass}>
                <button
                  className={stepButtonClass}
                  onClick={() => handleStepClick(index)}
                  disabled={isDisabled}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${step.label}, Step ${index + 1}${isCompleted ? ', completed' : ''}${isActive ? ', active' : ''}`}
                  title={step.description}
                >
                  <span className="Stepper__step-indicator">
                    {isCompleted ? (
                      <span className="Stepper__step-checkmark">✓</span>
                    ) : isError ? (
                      <span className="Stepper__step-error">!</span>
                    ) : (
                      <span className="Stepper__step-number">{index + 1}</span>
                    )}
                  </span>
                </button>

                {/* Step label and description */}
                <div className="Stepper__step-label-container">
                  <h3 className="Stepper__step-label">{step.label}</h3>
                  {step.description && (
                    <p className="Stepper__step-description">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line (between steps) */}
              {index < steps.length - 1 && (
                <div
                  className={`Stepper__connector ${
                    isCompleted ? 'Stepper__connector--completed' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Optional: Current step content */}
      {steps[active] && steps[active].content && (
        <div className="Stepper__content">{steps[active].content}</div>
      )}
    </div>
  )
}

/**
 * Stepper with manual content control
 * Use for custom step content layouts
 */
export function StepperContent({ children }) {
  return <div className="Stepper__content">{children}</div>
}

/**
 * Helper to determine step status
 */
export function getStepStatus(currentStep, stepIndex) {
  if (stepIndex < currentStep) return 'completed'
  if (stepIndex === currentStep) return 'active'
  return 'pending'
}
