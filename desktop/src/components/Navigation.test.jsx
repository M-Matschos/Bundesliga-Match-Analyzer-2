import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Breadcrumb from './Breadcrumb'
import Tabs, { TabPanel } from './Tabs'
import Stepper, { getStepStatus } from './Stepper'
import Sidebar, { SidebarGroup } from './Sidebar'
import '@testing-library/jest-dom'

describe('Navigation Pattern', () => {
  describe('Breadcrumb Component', () => {
    it('renders default breadcrumb hierarchy', () => {
      const items = [
        { id: '1', label: 'Home' },
        { id: '2', label: 'Matches' },
        { id: '3', label: 'Match Details' },
      ]
      const { container } = render(<Breadcrumb items={items} />)
      expect(container.querySelector('.Breadcrumb')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Matches')).toBeInTheDocument()
      expect(screen.getByText('Match Details')).toBeInTheDocument()
    })

    it('renders last item as non-clickable', () => {
      const items = [
        { id: '1', label: 'Home' },
        { id: '2', label: 'Current' },
      ]
      const { container } = render(<Breadcrumb items={items} />)
      const lastItem = container.querySelector('.Breadcrumb__text--active')
      expect(lastItem).toBeInTheDocument()
      expect(lastItem.tagName).not.toBe('BUTTON')
    })

    it('renders earlier items as clickable buttons', () => {
      const items = [
        { id: '1', label: 'Home' },
        { id: '2', label: 'Current' },
      ]
      const { container } = render(<Breadcrumb items={items} />)
      const buttons = container.querySelectorAll('.Breadcrumb__link')
      expect(buttons.length).toBe(1) // Only first item is button
      expect(buttons[0].textContent).toBe('Home')
    })

    it('calls onNavigate when breadcrumb link clicked', () => {
      const onNavigate = jest.fn()
      const items = [
        { id: '1', label: 'Home' },
        { id: '2', label: 'Current' },
      ]
      render(<Breadcrumb items={items} onNavigate={onNavigate} />)
      fireEvent.click(screen.getByText('Home'))
      expect(onNavigate).toHaveBeenCalledWith({ id: '1', label: 'Home' })
    })

    it('renders custom separator', () => {
      const items = [
        { id: '1', label: 'Home' },
        { id: '2', label: 'Current' },
      ]
      const { container } = render(<Breadcrumb items={items} separator=">" />)
      const separator = container.querySelector('.Breadcrumb__separator')
      expect(separator).toHaveTextContent('>')
    })

    it('returns null with empty items', () => {
      const { container } = render(<Breadcrumb items={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('has semantic nav element with aria-label', () => {
      const items = [{ id: '1', label: 'Home' }]
      const { container } = render(<Breadcrumb items={items} />)
      const nav = container.querySelector('nav[aria-label="Breadcrumb"]')
      expect(nav).toBeInTheDocument()
    })
  })

  describe('Tabs Component', () => {
    it('renders tabs with content', () => {
      const tabs = [
        { id: 'tab1', label: 'Dashboard', content: <div>Dashboard Content</div> },
        { id: 'tab2', label: 'Weekend', content: <div>Weekend Content</div> },
      ]
      render(<Tabs tabs={tabs} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Weekend')).toBeInTheDocument()
    })

    it('displays active tab content', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      ]
      render(<Tabs tabs={tabs} defaultActiveId="tab1" />)
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeVisible()
    })

    it('switches content on tab click', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      ]
      render(<Tabs tabs={tabs} defaultActiveId="tab1" />)
      fireEvent.click(screen.getByText('Tab 2'))
      expect(screen.getByText('Content 2')).toBeVisible()
    })

    it('calls onTabChange callback', () => {
      const onTabChange = jest.fn()
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
      ]
      render(<Tabs tabs={tabs} onTabChange={onTabChange} />)
      fireEvent.click(screen.getByText('Tab 2'))
      expect(onTabChange).toHaveBeenCalledWith('tab2')
    })

    it('supports keyboard navigation (arrow keys)', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
        { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ]
      const { container } = render(<Tabs tabs={tabs} />)
      const tabList = container.querySelector('.Tabs__list')

      // Move to next tab with ArrowRight
      fireEvent.keyDown(tabList, { key: 'ArrowRight' })
      expect(screen.getByText('Content 2')).toBeVisible()
    })

    it('supports keyboard navigation (Home/End)', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
        { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ]
      const { container } = render(<Tabs tabs={tabs} />)
      const tabList = container.querySelector('.Tabs__list')

      // Go to last tab with End key
      fireEvent.keyDown(tabList, { key: 'End' })
      expect(screen.getByText('Content 3')).toBeVisible()
    })

    it('skips disabled tabs', () => {
      const tabs = [
        { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
        { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
        { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
      ]
      render(<Tabs tabs={tabs} />)
      fireEvent.click(screen.getByText('Tab 2'))
      // Should remain on tab 1 since tab 2 is disabled
      expect(screen.getByText('Content 1')).toBeVisible()
    })

    it('renders tab badges', () => {
      const tabs = [
        { id: 'tab1', label: 'Inbox', badge: '3', content: <div>Content</div> },
      ]
      render(<Tabs tabs={tabs} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders variant: pills', () => {
      const { container } = render(
        <Tabs tabs={[{ id: 'tab1', label: 'Tab', content: <div>Content</div> }]} variant="pills" />
      )
      expect(container.querySelector('.Tabs__list--pills')).toBeInTheDocument()
    })

    it('renders full-width tabs', () => {
      const { container } = render(
        <Tabs tabs={[{ id: 'tab1', label: 'Tab', content: <div>Content</div> }]} fullWidth />
      )
      expect(container.querySelector('.Tabs__list--full-width')).toBeInTheDocument()
    })
  })

  describe('Stepper Component', () => {
    it('renders all steps', () => {
      const steps = [
        { id: 'step1', label: 'League Selection' },
        { id: 'step2', label: 'Parameters' },
        { id: 'step3', label: 'Results' },
      ]
      render(<Stepper steps={steps} />)
      expect(screen.getByText('League Selection')).toBeInTheDocument()
      expect(screen.getByText('Parameters')).toBeInTheDocument()
      expect(screen.getByText('Results')).toBeInTheDocument()
    })

    it('displays step numbers', () => {
      const steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2' },
      ]
      const { container } = render(<Stepper steps={steps} />)
      const numbers = container.querySelectorAll('.Stepper__step-number')
      expect(numbers.length).toBeGreaterThan(0)
    })

    it('marks completed steps with checkmark', () => {
      const steps = [
        { id: 'step1', label: 'Step 1', status: 'pending' },
        { id: 'step2', label: 'Step 2', status: 'completed' },
      ]
      const { container } = render(<Stepper steps={steps} activeStep={2} />)
      const checkmarks = container.querySelectorAll('.Stepper__step-checkmark')
      expect(checkmarks.length).toBeGreaterThan(0)
    })

    it('marks active step', () => {
      const steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2' },
      ]
      const { container } = render(<Stepper steps={steps} activeStep={1} />)
      const activeSteps = container.querySelectorAll('.Stepper__step--active')
      expect(activeSteps.length).toBe(1)
    })

    it('supports vertical orientation', () => {
      const { container } = render(
        <Stepper steps={[{ id: 'step1', label: 'Step 1' }]} orientation="vertical" />
      )
      expect(container.querySelector('.Stepper--vertical')).toBeInTheDocument()
    })

    it('calls onStepClick when clickable', () => {
      const onStepClick = jest.fn()
      const steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2' },
      ]
      render(<Stepper steps={steps} clickable onStepClick={onStepClick} />)
      fireEvent.click(screen.getByText('Step 2'))
      expect(onStepClick).toHaveBeenCalledWith(1)
    })

    it('shows step descriptions', () => {
      const steps = [
        { id: 'step1', label: 'Step 1', description: 'Select your leagues' },
      ]
      render(<Stepper steps={steps} />)
      expect(screen.getByText('Select your leagues')).toBeInTheDocument()
    })

    it('displays error state for failed steps', () => {
      const { container } = render(
        <Stepper steps={[{ id: 'step1', label: 'Step 1', status: 'error' }]} />
      )
      expect(container.querySelector('.Stepper__step--error')).toBeInTheDocument()
    })

    it('disables disabled steps', () => {
      const steps = [
        { id: 'step1', label: 'Step 1' },
        { id: 'step2', label: 'Step 2', disabled: true },
      ]
      const { container } = render(<Stepper steps={steps} clickable />)
      const disabledSteps = container.querySelectorAll('.Stepper__step--disabled')
      expect(disabledSteps.length).toBe(1)
    })

    it('helper: getStepStatus returns correct status', () => {
      expect(getStepStatus(2, 0)).toBe('completed')
      expect(getStepStatus(2, 1)).toBe('completed')
      expect(getStepStatus(2, 2)).toBe('active')
      expect(getStepStatus(2, 3)).toBe('pending')
    })
  })

  describe('Sidebar Component', () => {
    it('renders sidebar with items', () => {
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'matches', label: 'Matches', icon: '⚽' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Matches')).toBeInTheDocument()
    })

    it('renders icons', () => {
      const items = [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }]
      render(<Sidebar items={items} />)
      expect(screen.getByText('📊')).toBeInTheDocument()
    })

    it('calls onItemClick when item clicked', () => {
      const onItemClick = jest.fn()
      const items = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      ]
      render(<Sidebar items={items} onItemClick={onItemClick} />)
      fireEvent.click(screen.getByText('Dashboard'))
      expect(onItemClick).toHaveBeenCalledWith('dashboard')
    })

    it('highlights active item', () => {
      const { container } = render(
        <Sidebar items={[{ id: 'dashboard', label: 'Dashboard' }]} defaultActiveId="dashboard" />
      )
      const activeItem = container.querySelector('.Sidebar__item--active')
      expect(activeItem).toBeInTheDocument()
    })

    it('supports collapse toggle', () => {
      const onCollapsedChange = jest.fn()
      const { container } = render(
        <Sidebar items={[{ id: 'dashboard', label: 'Dashboard' }]} onCollapsedChange={onCollapsedChange} />
      )
      const toggle = container.querySelector('.Sidebar__toggle')
      fireEvent.click(toggle)
      expect(onCollapsedChange).toHaveBeenCalledWith(true)
    })

    it('hides labels when collapsed', () => {
      const { container } = render(
        <Sidebar items={[{ id: 'dashboard', label: 'Dashboard' }]} collapsed />
      )
      expect(container.querySelector('.Sidebar--collapsed')).toBeInTheDocument()
    })

    it('renders badges', () => {
      const items = [
        { id: 'inbox', label: 'Inbox', badge: '5' },
      ]
      render(<Sidebar items={items} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('disables disabled items', () => {
      const items = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'settings', label: 'Settings', disabled: true },
      ]
      const { container } = render(<Sidebar items={items} />)
      const disabledItems = container.querySelectorAll('.Sidebar__item--disabled')
      expect(disabledItems.length).toBe(1)
    })

    it('renders sidebar groups', () => {
      const groupItems = [
        { id: 'profile', label: 'Profile' },
        { id: 'preferences', label: 'Preferences' },
      ]
      render(<SidebarGroup label="User" items={groupItems} />)
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('supports different variants', () => {
      const { container } = render(
        <Sidebar items={[{ id: 'dashboard', label: 'Dashboard' }]} variant="compact" />
      )
      expect(container.querySelector('.Sidebar--compact')).toBeInTheDocument()
    })
  })

  describe('Navigation Accessibility', () => {
    it('Breadcrumb has semantic navigation', () => {
      const { container } = render(
        <Breadcrumb items={[{ id: '1', label: 'Home' }]} />
      )
      expect(container.querySelector('nav')).toBeInTheDocument()
    })

    it('Tabs have proper ARIA attributes', () => {
      const { container } = render(
        <Tabs tabs={[{ id: 'tab1', label: 'Tab 1', content: <div>Content</div> }]} />
      )
      const tabs = container.querySelectorAll('[role="tab"]')
      expect(tabs.length).toBeGreaterThan(0)
    })

    it('Stepper items have ARIA labels', () => {
      const { container } = render(
        <Stepper steps={[{ id: 'step1', label: 'Step 1' }]} />
      )
      const labels = container.querySelectorAll('[aria-label]')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('Sidebar has navigation role', () => {
      const { container } = render(
        <Sidebar items={[{ id: 'dashboard', label: 'Dashboard' }]} />
      )
      expect(container.querySelector('aside[role="navigation"]')).toBeInTheDocument()
    })
  })
})
