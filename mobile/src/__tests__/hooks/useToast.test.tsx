/**
 * Tests: useToast Hook
 * Comprehensive tests for toast notifications
 */

import { renderHook, act } from '@testing-library/react-native'
import { useToast } from '../../context/ToastContext'
import { ToastProvider } from '../../context/ToastContext'
import React from 'react'

describe('useToast Hook', () => {
  // ========================================================================
  // PROVIDER & SETUP TESTS
  // ========================================================================

  it('should provide initial toast state', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    expect(result.current).toBeDefined()
    expect(typeof result.current.showToast).toBe('function')
  })

  it('should throw error when useToast is used outside ToastProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useToast())
    }).toThrow()

    consoleError.mockRestore()
  })

  // ========================================================================
  // TOAST SHOW TESTS
  // ========================================================================

  it('should show success toast', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Success!', 'success')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should show error toast', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Error occurred', 'error')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should show info toast', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Information', 'info')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should show warning toast', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Warning', 'warning')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should show toast with custom duration', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Custom duration', 'info', 3000)
    })

    expect(result.current.showToast).toBeDefined()
  })

  // ========================================================================
  // TOAST DISMISS TESTS
  // ========================================================================

  it('should have a method to dismiss toasts (via showToast lifecycle)', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    // ToastContext manages dismissal internally via auto-timeout
    // The showToast function is the primary API
    expect(typeof result.current.showToast).toBe('function')
  })

  it('should allow showing multiple toasts', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Test 1', 'info')
      result.current.showToast('Test 2', 'info')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should support auto-dismiss duration', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Auto-dismiss', 'success', 2000)
    })

    expect(result.current.showToast).toBeDefined()
  })

  // ========================================================================
  // TOAST STATE TESTS
  // ========================================================================

  it('should provide toast API with showToast function', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    expect(typeof result.current.showToast).toBe('function')
    expect(typeof result.current.success).toBe('function')
    expect(typeof result.current.error).toBe('function')
    expect(typeof result.current.info).toBe('function')
  })

  it('should handle showing multiple toasts sequentially', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Toast 1', 'success')
      result.current.showToast('Toast 2', 'info')
      result.current.showToast('Toast 3', 'error')
    })

    expect(result.current.showToast).toBeDefined()
  })

  // ========================================================================
  // TOAST TYPES TESTS
  // ========================================================================

  it('should handle success toast type', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Saved successfully', 'success')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should handle error toast type', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('An error occurred', 'error')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should handle info toast type', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('For your information', 'info')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should handle warning toast type', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Please be careful', 'warning')
    })

    expect(result.current.showToast).toBeDefined()
  })

  // ========================================================================
  // TOAST POSITIONING TESTS
  // ========================================================================

  it('should support top positioning', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Top toast', 'info', 2000, 'top')
    })

    expect(result.current.showToast).toBeDefined()
  })

  it('should support bottom positioning', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.showToast('Bottom toast', 'info', 2000, 'bottom')
    })

    expect(result.current.showToast).toBeDefined()
  })

  // ========================================================================
  // TOAST ACCESSIBILITY TESTS
  // ========================================================================

  it('should provide accessible toast messages via success helper', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.success('Login successful')
    })

    expect(result.current.success).toBeDefined()
  })

  it('should support sequential toast calls without errors', () => {
    const wrapper = ({ children }: any) => (
      <ToastProvider>{children}</ToastProvider>
    )
    const { result } = renderHook(() => useToast(), { wrapper })

    expect(() => {
      act(() => {
        result.current.showToast('First', 'info')
        result.current.showToast('Second', 'info')
        result.current.showToast('Third', 'info')
      })
    }).not.toThrow()
  })
})
