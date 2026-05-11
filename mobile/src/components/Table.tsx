import React, { useState, useMemo } from 'react'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { colors, SPACING } from '../theme/colors'

/**
 * Table Component (React Native) — Mobile table for match data, standings
 *
 * Uses FlatList instead of HTML table
 * Variants: sortable, striped, dense
 * States: default, loading (skeletons), empty, error
 */

interface Column {
  key: string
  label: string
  width?: 'auto' | 'narrow' | 'wide'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface Row {
  id: string
  [key: string]: any
}

interface TableProps {
  columns: Column[]
  data: Row[]
  sortable?: boolean
  striped?: boolean
  hover?: boolean
  dense?: boolean
  loading?: boolean
  empty?: string
  onRowClick?: (row: Row) => void
  error?: string
}

export default function Table({
  columns = [],
  data = [],
  sortable = false,
  striped = false,
  hover = false,
  dense = false,
  loading = false,
  empty = 'No data found',
  onRowClick = null,
  error = null,
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({
    key: null,
    direction: 'asc',
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: SPACING.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
      paddingVertical: dense ? SPACING.sm : SPACING.md,
      paddingHorizontal: dense ? SPACING.sm : SPACING.md,
    },
    headerCell: {
      flex: 1,
      paddingHorizontal: dense ? SPACING.xs : SPACING.sm,
    },
    headerText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecond,
    },
    headerCellSortable: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sortIndicator: {
      fontSize: 12,
      color: colors.blue,
      marginLeft: SPACING.xs,
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: dense ? SPACING.sm : SPACING.md,
      paddingHorizontal: dense ? SPACING.sm : SPACING.md,
      backgroundColor: colors.surface,
    },
    rowStriped: {
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
    },
    rowHover: {
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    cell: {
      flex: 1,
      paddingHorizontal: dense ? SPACING.xs : SPACING.sm,
      justifyContent: 'center',
    },
    cellText: {
      fontSize: dense ? 12 : 14,
      color: colors.text,
    },
    cellLeft: {
      alignItems: 'flex-start',
    },
    cellCenter: {
      alignItems: 'center',
    },
    cellRight: {
      alignItems: 'flex-end',
    },
    loadingContainer: {
      padding: SPACING.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      padding: SPACING.xxl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: SPACING.md,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecond,
    },
    errorContainer: {
      padding: SPACING.lg,
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      borderRadius: SPACING.md,
      borderWidth: 1,
      borderColor: colors.red,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    errorIcon: {
      fontSize: 24,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: colors.red,
    },
    skeletonLine: {
      height: 16,
      backgroundColor: colors.border,
      borderRadius: SPACING.sm,
    },
  })

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return data

    const key = sortConfig.key
    const sorted = [...data].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    })

    return sorted
  }, [data, sortConfig, sortable])

  const handleSort = (columnKey: string) => {
    if (!sortable) return

    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { key: columnKey, direction: 'asc' }
    })
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          {columns.map((col) => (
            <View key={col.key} style={styles.headerCell}>
              <Text style={styles.headerText}>{col.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </View>
    )
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  // Empty state
  if (sortedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>{empty}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        {columns.map((col) => (
          <TouchableOpacity
            key={col.key}
            style={styles.headerCell}
            disabled={!col.sortable}
            onPress={() => handleSort(col.key)}
            activeOpacity={col.sortable ? 0.6 : 1}
          >
            {col.sortable ? (
              <View style={styles.headerCellSortable}>
                <Text style={styles.headerText}>{col.label}</Text>
                {sortConfig.key === col.key && (
                  <Text style={styles.sortIndicator}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.headerText}>{col.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Data Rows */}
      <FlatList
        data={sortedData}
        keyExtractor={(row) => row.id}
        scrollEnabled={false}
        renderItem={({ item: row, index }) => (
          <TouchableOpacity
            style={[
              styles.row,
              striped && index % 2 === 1 && styles.rowStriped,
              hover && styles.rowHover,
            ]}
            disabled={!onRowClick}
            onPress={() => onRowClick && onRowClick(row)}
            activeOpacity={onRowClick ? 0.6 : 1}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.cell,
                  col.align === 'left' && styles.cellLeft,
                  col.align === 'center' && styles.cellCenter,
                  col.align === 'right' && styles.cellRight,
                ]}
              >
                <Text style={styles.cellText}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </Text>
              </View>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
