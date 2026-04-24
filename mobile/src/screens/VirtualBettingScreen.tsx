/**
 * Virtual Betting Screen — Place and manage virtual bets
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { COLORS, SPACING, RADIUS, formatProb } from '../theme/colors'
import { bettingService, predictionService } from '../services/api'

interface Bet {
  bet_id: string
  match_id: string
  bet_type: string
  odds: number
  amount: number
  status: string
  win_amount?: number
  created_at: string
}

interface Portfolio {
  total_bets: number
  stats: {
    total_staked: number
    total_winnings: number
    total_losses: number
    net_profit: number
    roi: number
    win_rate: number
    won_bets: number
    lost_bets: number
    pending_bets: number
  }
}

export default function VirtualBettingScreen({ navigation }: any) {
  const [bets, setBets] = useState<Bet[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'settled'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [betsData, portfolioData] = await Promise.all([
        bettingService.getMyBets(),
        bettingService.getPortfolioStats(),
      ])
      setBets(betsData.bets || [])
      setPortfolio(portfolioData)
    } catch (error) {
      console.error('Failed to fetch bets:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const filteredBets = bets.filter((bet) => {
    if (selectedTab === 'pending') return bet.status === 'pending'
    if (selectedTab === 'settled')
      return ['won', 'lost', 'void'].includes(bet.status)
    return true
  })

  const getStatusColor = (status: string) => {
    if (status === 'won') return COLORS.greenLight
    if (status === 'lost') return COLORS.red
    if (status === 'pending') return COLORS.yellow
    return COLORS.textMuted
  }

  const getStatusLabel = (status: string) => {
    if (status === 'won') return '✓ Gewonnen'
    if (status === 'lost') return '✗ Verloren'
    if (status === 'pending') return '⏳ Ausstehend'
    return 'Annulliert'
  }

  if (loading && bets.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.blueLight} />
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Virtuelle Wetten</Text>
        <Text style={styles.subtitle}>Dein Portfolio und aktive Wetten</Text>
      </View>

      {/* Portfolio Stats */}
      {portfolio && (
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gesamt eingesetzt</Text>
            <Text style={styles.statValue}>€{portfolio.stats.total_staked.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gewinn/Verlust</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    portfolio.stats.net_profit >= 0
                      ? COLORS.greenLight
                      : COLORS.red,
                },
              ]}
            >
              €{portfolio.stats.net_profit.toFixed(2)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ROI</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color:
                    portfolio.stats.roi >= 0 ? COLORS.greenLight : COLORS.red,
                },
              ]}
            >
              {(portfolio.stats.roi * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Gewinnquote</Text>
            <Text style={styles.statValue}>
              {formatProb(portfolio.stats.win_rate)}
            </Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'all' && styles.tabTextActive,
            ]}
          >
            Alle ({bets.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'pending' && styles.tabTextActive,
            ]}
          >
            Ausstehend ({portfolio?.stats.pending_bets || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settled' && styles.tabActive]}
          onPress={() => setSelectedTab('settled')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'settled' && styles.tabTextActive,
            ]}
          >
            Beendet ({(portfolio?.stats.won_bets || 0) + (portfolio?.stats.lost_bets || 0)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bets List */}
      <View style={styles.section}>
        {filteredBets.length === 0 ? (
          <Text style={styles.emptyText}>Keine Wetten in dieser Kategorie</Text>
        ) : (
          filteredBets.map((bet) => (
            <View key={bet.bet_id} style={styles.betCard}>
              <View style={styles.betHeader}>
                <View>
                  <Text style={styles.betType}>
                    {bet.bet_type === 'home_win'
                      ? 'Heimsieg'
                      : bet.bet_type === 'away_win'
                      ? 'Auswärtssieg'
                      : 'Remis'}
                  </Text>
                  <Text style={styles.betDate}>
                    {new Date(bet.created_at).toLocaleDateString('de-DE')}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.betStatus,
                      { color: getStatusColor(bet.status) },
                    ]}
                  >
                    {getStatusLabel(bet.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.betDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Einsatz</Text>
                  <Text style={styles.detailValue}>€{bet.amount.toFixed(2)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Quote</Text>
                  <Text style={styles.detailValue}>{bet.odds.toFixed(2)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Möglicher Gewinn</Text>
                  <Text style={styles.detailValue}>
                    €{(bet.amount * bet.odds).toFixed(2)}
                  </Text>
                </View>

                {bet.win_amount && bet.status === 'won' && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Gewonnen</Text>
                    <Text style={[styles.detailValue, { color: COLORS.greenLight }]}>
                      €{bet.win_amount.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {bet.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    /* Handle cancel */
                  }}
                >
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Footer Spacing */}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecond,
  },
  statsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: COLORS.blueLight,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.blueLight,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  betCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blueLight,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  betType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  betDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  betStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.blueLight,
  },
  cancelButton: {
    backgroundColor: COLORS.red,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
})
