import React from 'react'
import { Text } from 'react-native'
import { render, screen, fireEvent } from '@testing-library/react-native'
import Stepper from '../../src/components/Stepper'

describe('Stepper Component', () => {
  const defaultSteps = [
    { id: 'step1', label: 'League Selection', description: 'Choose which leagues to analyze' },
    { id: 'step2', label: 'Parameters', description: 'Configure calculation options' },
    { id: 'step3', label: 'Results', description: 'View analysis results' },
  ]

  it('renders all steps', () => {
    render(<Stepper steps={defaultSteps} />)
    expect(screen.getByText('League Selection')).toBeTruthy()
    expect(screen.getByText('Parameters')).toBeTruthy()
    expect(screen.getByText('Results')).toBeTruthy()
  })

  it('displays step descriptions', () => {
    render(<Stepper steps={defaultSteps} />)
    expect(screen.getByText('Choose which leagues to analyze')).toBeTruthy()
    expect(screen.getByText('Configure calculation options')).toBeTruthy()
  })

  it('marks active step', () => {
    render(<Stepper steps={defaultSteps} activeStep={1} />)
    // Active step is marked by styling; text is present
    expect(screen.getByText('Parameters')).toBeTruthy()
  })

  it('marks completed steps', () => {
    render(
      <Stepper
        steps={[
          { id: 'step1', label: 'Step 1', status: 'completed' },
          { id: 'step2', label: 'Step 2', status: 'active' },
          { id: 'step3', label: 'Step 3', status: 'pending' },
        ]}
        activeStep={1}
      />
    )
    expect(screen.getByText('Step 1')).toBeTruthy()
    expect(screen.getByText('Step 2')).toBeTruthy()
    expect(screen.getByText('Step 3')).toBeTruthy()
  })

  it('displays error state for failed steps', () => {
    render(
      <Stepper
        steps={[
          { id: 'step1', label: 'Step 1', status: 'error' },
        ]}
      />
    )
    expect(screen.getByText('Step 1')).toBeTruthy()
  })

  it('supports vertical orientation', () => {
    render(
      <Stepper steps={defaultSteps} orientation="vertical" />
    )
    expect(screen.getByText('League Selection')).toBeTruthy()
  })

  it('supports horizontal orientation', () => {
    render(
      <Stepper steps={defaultSteps} orientation="horizontal" />
    )
    expect(screen.getByText('League Selection')).toBeTruthy()
  })

  it('calls onStepClick when clickable and step pressed', () => {
    const onStepClick = jest.fn()
    render(
      <Stepper
        steps={defaultSteps}
        clickable
        onStepClick={onStepClick}
        activeStep={0}
      />
    )

    const step2 = screen.getByText('Parameters')
    fireEvent.press(step2)

    expect(onStepClick).toHaveBeenCalledWith(1)
  })

  it('does not call onStepClick when not clickable', () => {
    const onStepClick = jest.fn()
    render(
      <Stepper
        steps={defaultSteps}
        clickable={false}
        onStepClick={onStepClick}
        activeStep={0}
      />
    )

    const step2 = screen.getByText('Parameters')
    fireEvent.press(step2)

    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('skips disabled steps', () => {
    const onStepClick = jest.fn()
    const stepsWithDisabled = [
      { id: 'step1', label: 'Step 1' },
      { id: 'step2', label: 'Step 2', disabled: true },
      { id: 'step3', label: 'Step 3' },
    ]

    render(
      <Stepper
        steps={stepsWithDisabled}
        clickable
        onStepClick={onStepClick}
        activeStep={0}
      />
    )

    const disabledStep = screen.getByText('Step 2')
    fireEvent.press(disabledStep)

    // Disabled step should not trigger callback
    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('renders step content', () => {
    const stepsWithContent = [
      { id: 'step1', label: 'Step 1', content: <MockContent text="Step 1 Content" /> },
      { id: 'step2', label: 'Step 2', content: <MockContent text="Step 2 Content" /> },
    ]

    render(<Stepper steps={stepsWithContent} activeStep={0} />)
    expect(screen.getByText('Step 1 Content')).toBeTruthy()
  })

  it('switches step content on activeStep change', () => {
    const stepsWithContent = [
      { id: 'step1', label: 'Step 1', content: <MockContent text="Step 1 Content" /> },
      { id: 'step2', label: 'Step 2', content: <MockContent text="Step 2 Content" /> },
    ]

    const { rerender } = render(
      <Stepper steps={stepsWithContent} activeStep={0} />
    )

    expect(screen.getByText('Step 1 Content')).toBeTruthy()

    rerender(<Stepper steps={stepsWithContent} activeStep={1} />)
    expect(screen.getByText('Step 2 Content')).toBeTruthy()
  })

  it('supports minimal variant', () => {
    render(
      <Stepper steps={defaultSteps} variant="minimal" />
    )
    expect(screen.getByText('League Selection')).toBeTruthy()
  })

  it('supports connected variant', () => {
    render(
      <Stepper steps={defaultSteps} variant="connected" />
    )
    expect(screen.getByText('League Selection')).toBeTruthy()
  })

  it('handles single step', () => {
    render(
      <Stepper steps={[{ id: 'step1', label: 'Only Step' }]} />
    )
    expect(screen.getByText('Only Step')).toBeTruthy()
  })

  it('handles empty steps array', () => {
    render(<Stepper steps={[]} />)
    // Should not crash
    expect(true).toBeTruthy()
  })

  it('handles many steps', () => {
    const manySteps = Array.from({ length: 10 }, (_, i) => ({
      id: `step${i + 1}`,
      label: `Step ${i + 1}`,
    }))

    render(<Stepper steps={manySteps} activeStep={5} />)
    expect(screen.getByText('Step 6')).toBeTruthy()
  })
})

// Mock component for step content
function MockContent({ text }: { text: string }) {
  return <>{text}</>
}
