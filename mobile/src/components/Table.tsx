import React, { useState, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
import { useTheme } from '../context/ThemeContext'
  View,
import { useTheme } from '../context/ThemeContext'
  FlatList,
import { useTheme } from '../context/ThemeContext'
  Text,
import { useTheme } from '../context/ThemeContext'
  TouchableOpacity,
import { useTheme } from '../context/ThemeContext'
  ActivityIndicator,
import { useTheme } from '../context/ThemeContext'
  StyleSheet,
import { useTheme } from '../context/ThemeContext'
} from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColors, SPACING, TYPOGRAPHY } from '../theme/design-tokens'
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
/**
import { useTheme } from '../context/ThemeContext'
 * Table Component (React Native) — Mobile table for match data, standings
import { useTheme } from '../context/ThemeContext'
 *
import { useTheme } from '../context/ThemeContext'
 * Uses FlatList instead of HTML table
import { useTheme } from '../context/ThemeContext'
 * Variants: sortable, striped, dense
import { useTheme } from '../context/ThemeContext'
 * States: default, loading (skeletons), empty, error
import { useTheme } from '../context/ThemeContext'
 */
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface Column {
import { useTheme } from '../context/ThemeContext'
  key: string
import { useTheme } from '../context/ThemeContext'
  label: string
import { useTheme } from '../context/ThemeContext'
  width?: 'auto' | 'narrow' | 'wide'
import { useTheme } from '../context/ThemeContext'
  align?: 'left' | 'center' | 'right'
import { useTheme } from '../context/ThemeContext'
  sortable?: boolean
import { useTheme } from '../context/ThemeContext'
  render?: (value: any, row: any) => React.ReactNode
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface Row {
import { useTheme } from '../context/ThemeContext'
  id: string
import { useTheme } from '../context/ThemeContext'
  [key: string]: any
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
interface TableProps {
import { useTheme } from '../context/ThemeContext'
  columns: Column[]
import { useTheme } from '../context/ThemeContext'
  data: Row[]
import { useTheme } from '../context/ThemeContext'
  sortable?: boolean
import { useTheme } from '../context/ThemeContext'
  striped?: boolean
import { useTheme } from '../context/ThemeContext'
  hover?: boolean
import { useTheme } from '../context/ThemeContext'
  dense?: boolean
import { useTheme } from '../context/ThemeContext'
  loading?: boolean
import { useTheme } from '../context/ThemeContext'
  empty?: string
import { useTheme } from '../context/ThemeContext'
  onRowClick?: (row: Row) => void
import { useTheme } from '../context/ThemeContext'
  error?: string
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
export default function Table({
import { useTheme } from '../context/ThemeContext'
  columns = [],
import { useTheme } from '../context/ThemeContext'
  data = [],
import { useTheme } from '../context/ThemeContext'
  sortable = false,
import { useTheme } from '../context/ThemeContext'
  striped = false,
import { useTheme } from '../context/ThemeContext'
  hover = false,
import { useTheme } from '../context/ThemeContext'
  dense = false,
import { useTheme } from '../context/ThemeContext'
  loading = false,
import { useTheme } from '../context/ThemeContext'
  empty = 'No data found',
import { useTheme } from '../context/ThemeContext'
  onRowClick = null,
import { useTheme } from '../context/ThemeContext'
  error = null,
import { useTheme } from '../context/ThemeContext'
}: TableProps) {
import { useTheme } from '../context/ThemeContext'
  const [sortConfig, setSortConfig] = useState<{
import { useTheme } from '../context/ThemeContext'
    key: string | null
import { useTheme } from '../context/ThemeContext'
    direction: 'asc' | 'desc'
import { useTheme } from '../context/ThemeContext'
  }>({
import { useTheme } from '../context/ThemeContext'
    key: null,
import { useTheme } from '../context/ThemeContext'
    direction: 'asc',
import { useTheme } from '../context/ThemeContext'
  })
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const styles = StyleSheet.create({
import { useTheme } from '../context/ThemeContext'
    container: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      overflow: 'hidden',
import { useTheme } from '../context/ThemeContext'
      borderWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.border,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    headerRow: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
      borderBottomWidth: 2,
import { useTheme } from '../context/ThemeContext'
      borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
      paddingVertical: dense ? SPACING.sm : SPACING.md,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: dense ? SPACING.sm : SPACING.md,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    headerCell: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: dense ? SPACING.xs : SPACING.sm,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    headerText: {
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.labelMd.size,
import { useTheme } from '../context/ThemeContext'
      fontWeight: TYPOGRAPHY.labelMd.weight,
import { useTheme } from '../context/ThemeContext'
      color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    headerCellSortable: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'space-between',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    sortIndicator: {
import { useTheme } from '../context/ThemeContext'
      fontSize: 12,
import { useTheme } from '../context/ThemeContext'
      color: colors.primary,
import { useTheme } from '../context/ThemeContext'
      marginLeft: SPACING.xs,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    row: {
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      borderBottomWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderBottomColor: colors.border,
import { useTheme } from '../context/ThemeContext'
      paddingVertical: dense ? SPACING.sm : SPACING.md,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: dense ? SPACING.sm : SPACING.md,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.surface,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    rowStriped: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    rowHover: {
import { useTheme } from '../context/ThemeContext'
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    cell: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      paddingHorizontal: dense ? SPACING.xs : SPACING.sm,
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    cellText: {
import { useTheme } from '../context/ThemeContext'
      fontSize: dense ? TYPOGRAPHY.bodySm.size : TYPOGRAPHY.bodyMd.size,
import { useTheme } from '../context/ThemeContext'
      color: colors.textPrimary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    cellLeft: {
import { useTheme } from '../context/ThemeContext'
      alignItems: 'flex-start',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    cellCenter: {
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    cellRight: {
import { useTheme } from '../context/ThemeContext'
      alignItems: 'flex-end',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    loadingContainer: {
import { useTheme } from '../context/ThemeContext'
      padding: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    emptyContainer: {
import { useTheme } from '../context/ThemeContext'
      padding: SPACING.xxl,
import { useTheme } from '../context/ThemeContext'
      justifyContent: 'center',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    emptyIcon: {
import { useTheme } from '../context/ThemeContext'
      fontSize: 48,
import { useTheme } from '../context/ThemeContext'
      marginBottom: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      opacity: 0.5,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    emptyText: {
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.bodyLg.size,
import { useTheme } from '../context/ThemeContext'
      color: colors.textSecondary,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    errorContainer: {
import { useTheme } from '../context/ThemeContext'
      padding: SPACING.lg,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.md,
import { useTheme } from '../context/ThemeContext'
      borderWidth: 1,
import { useTheme } from '../context/ThemeContext'
      borderColor: colors.danger,
import { useTheme } from '../context/ThemeContext'
      flexDirection: 'row',
import { useTheme } from '../context/ThemeContext'
      alignItems: 'center',
import { useTheme } from '../context/ThemeContext'
      gap: SPACING.md,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    errorIcon: {
import { useTheme } from '../context/ThemeContext'
      fontSize: 24,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    errorText: {
import { useTheme } from '../context/ThemeContext'
      flex: 1,
import { useTheme } from '../context/ThemeContext'
      fontSize: TYPOGRAPHY.bodyMd.size,
import { useTheme } from '../context/ThemeContext'
      color: colors.dangerLight,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
    skeletonLine: {
import { useTheme } from '../context/ThemeContext'
      height: 16,
import { useTheme } from '../context/ThemeContext'
      backgroundColor: colors.border,
import { useTheme } from '../context/ThemeContext'
      borderRadius: SPACING.sm,
import { useTheme } from '../context/ThemeContext'
    },
import { useTheme } from '../context/ThemeContext'
  })
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Sort data
import { useTheme } from '../context/ThemeContext'
  const sortedData = useMemo(() => {
import { useTheme } from '../context/ThemeContext'
    if (!sortable || !sortConfig.key) return data
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    const sorted = [...data].sort((a, b) => {
import { useTheme } from '../context/ThemeContext'
      const aVal = a[sortConfig.key]
import { useTheme } from '../context/ThemeContext'
      const bVal = b[sortConfig.key]
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      if (aVal === null || aVal === undefined) return 1
import { useTheme } from '../context/ThemeContext'
      if (bVal === null || bVal === undefined) return -1
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      if (typeof aVal === 'string') {
import { useTheme } from '../context/ThemeContext'
        return sortConfig.direction === 'asc'
import { useTheme } from '../context/ThemeContext'
          ? aVal.localeCompare(bVal)
import { useTheme } from '../context/ThemeContext'
          : bVal.localeCompare(aVal)
import { useTheme } from '../context/ThemeContext'
      }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
import { useTheme } from '../context/ThemeContext'
    })
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    return sorted
import { useTheme } from '../context/ThemeContext'
  }, [data, sortConfig, sortable])
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  const handleSort = (columnKey: string) => {
import { useTheme } from '../context/ThemeContext'
    if (!sortable) return
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
    setSortConfig((prev) => {
import { useTheme } from '../context/ThemeContext'
      if (prev.key === columnKey) {
import { useTheme } from '../context/ThemeContext'
        return {
import { useTheme } from '../context/ThemeContext'
          key: columnKey,
import { useTheme } from '../context/ThemeContext'
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
import { useTheme } from '../context/ThemeContext'
        }
import { useTheme } from '../context/ThemeContext'
      }
import { useTheme } from '../context/ThemeContext'
      return { key: columnKey, direction: 'asc' }
import { useTheme } from '../context/ThemeContext'
    })
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Loading state
import { useTheme } from '../context/ThemeContext'
  if (loading) {
import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.container}>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.headerRow}>
import { useTheme } from '../context/ThemeContext'
          {columns.map((col) => (
import { useTheme } from '../context/ThemeContext'
            <View key={col.key} style={styles.headerCell}>
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.headerText}>{col.label}</Text>
import { useTheme } from '../context/ThemeContext'
            </View>
import { useTheme } from '../context/ThemeContext'
          ))}
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
        <View style={styles.loadingContainer}>
import { useTheme } from '../context/ThemeContext'
          <ActivityIndicator size="large" color={colors.primary} />
import { useTheme } from '../context/ThemeContext'
        </View>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Error state
import { useTheme } from '../context/ThemeContext'
  if (error) {
import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.errorContainer}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.errorIcon}>⚠️</Text>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.errorText}>{error}</Text>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  // Empty state
import { useTheme } from '../context/ThemeContext'
  if (sortedData.length === 0) {
import { useTheme } from '../context/ThemeContext'
    return (
import { useTheme } from '../context/ThemeContext'
      <View style={styles.emptyContainer}>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.emptyIcon}>📊</Text>
import { useTheme } from '../context/ThemeContext'
        <Text style={styles.emptyText}>{empty}</Text>
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'
    )
import { useTheme } from '../context/ThemeContext'
  }
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
  return (
import { useTheme } from '../context/ThemeContext'
    <View style={styles.container}>
import { useTheme } from '../context/ThemeContext'
      {/* Header Row */}
import { useTheme } from '../context/ThemeContext'
      <View style={styles.headerRow}>
import { useTheme } from '../context/ThemeContext'
        {columns.map((col) => (
import { useTheme } from '../context/ThemeContext'
          <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
            key={col.key}
import { useTheme } from '../context/ThemeContext'
            style={styles.headerCell}
import { useTheme } from '../context/ThemeContext'
            disabled={!col.sortable}
import { useTheme } from '../context/ThemeContext'
            onPress={() => handleSort(col.key)}
import { useTheme } from '../context/ThemeContext'
            activeOpacity={col.sortable ? 0.6 : 1}
import { useTheme } from '../context/ThemeContext'
          >
import { useTheme } from '../context/ThemeContext'
            {col.sortable ? (
import { useTheme } from '../context/ThemeContext'
              <View style={styles.headerCellSortable}>
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.headerText}>{col.label}</Text>
import { useTheme } from '../context/ThemeContext'
                {sortConfig.key === col.key && (
import { useTheme } from '../context/ThemeContext'
                  <Text style={styles.sortIndicator}>
import { useTheme } from '../context/ThemeContext'
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
import { useTheme } from '../context/ThemeContext'
                  </Text>
import { useTheme } from '../context/ThemeContext'
                )}
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            ) : (
import { useTheme } from '../context/ThemeContext'
              <Text style={styles.headerText}>{col.label}</Text>
import { useTheme } from '../context/ThemeContext'
            )}
import { useTheme } from '../context/ThemeContext'
          </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
        ))}
import { useTheme } from '../context/ThemeContext'
      </View>
import { useTheme } from '../context/ThemeContext'

import { useTheme } from '../context/ThemeContext'
      {/* Data Rows */}
import { useTheme } from '../context/ThemeContext'
      <FlatList
import { useTheme } from '../context/ThemeContext'
        data={sortedData}
import { useTheme } from '../context/ThemeContext'
        keyExtractor={(row) => row.id}
import { useTheme } from '../context/ThemeContext'
        scrollEnabled={false}
import { useTheme } from '../context/ThemeContext'
        renderItem={({ item: row, index }) => (
import { useTheme } from '../context/ThemeContext'
          <TouchableOpacity
import { useTheme } from '../context/ThemeContext'
            style={[
import { useTheme } from '../context/ThemeContext'
              styles.row,
import { useTheme } from '../context/ThemeContext'
              striped && index % 2 === 1 && styles.rowStriped,
import { useTheme } from '../context/ThemeContext'
              hover && styles.rowHover,
import { useTheme } from '../context/ThemeContext'
            ]}
import { useTheme } from '../context/ThemeContext'
            disabled={!onRowClick}
import { useTheme } from '../context/ThemeContext'
            onPress={() => onRowClick && onRowClick(row)}
import { useTheme } from '../context/ThemeContext'
            activeOpacity={onRowClick ? 0.6 : 1}
import { useTheme } from '../context/ThemeContext'
          >
import { useTheme } from '../context/ThemeContext'
            {columns.map((col) => (
import { useTheme } from '../context/ThemeContext'
              <View
import { useTheme } from '../context/ThemeContext'
                key={col.key}
import { useTheme } from '../context/ThemeContext'
                style={[
import { useTheme } from '../context/ThemeContext'
                  styles.cell,
import { useTheme } from '../context/ThemeContext'
                  col.align === 'left' && styles.cellLeft,
import { useTheme } from '../context/ThemeContext'
                  col.align === 'center' && styles.cellCenter,
import { useTheme } from '../context/ThemeContext'
                  col.align === 'right' && styles.cellRight,
import { useTheme } from '../context/ThemeContext'
                ]}
import { useTheme } from '../context/ThemeContext'
              >
import { useTheme } from '../context/ThemeContext'
                <Text style={styles.cellText}>
import { useTheme } from '../context/ThemeContext'
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
import { useTheme } from '../context/ThemeContext'
                </Text>
import { useTheme } from '../context/ThemeContext'
              </View>
import { useTheme } from '../context/ThemeContext'
            ))}
import { useTheme } from '../context/ThemeContext'
          </TouchableOpacity>
import { useTheme } from '../context/ThemeContext'
        )}
import { useTheme } from '../context/ThemeContext'
      />
import { useTheme } from '../context/ThemeContext'
    </View>
import { useTheme } from '../context/ThemeContext'
  )
import { useTheme } from '../context/ThemeContext'
}
import { useTheme } from '../context/ThemeContext'
