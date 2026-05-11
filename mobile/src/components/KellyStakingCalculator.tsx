/**
 * Match Oracle — Kelly Staking Calculator
 * Half-Kelly (Conservative) für sichere Wettgrößen basierend auf Edge
 *
 * Kelly Formula: f = (b*p - q) / b
 * where: b = odds-1, p = probability, q = 1-p
 * Half-Kelly = f / 2 (mehr konservativ)
 */
import React, { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { getColors, SPACING, RADIUS } from '../theme/colors'
import { typography } from '../theme/typography'
import { useTheme } from '../context/ThemeContext'

interface KellyCalculatorProps {
  bankroll: number
  onStakeChange?: (stake: number) => void
}

export default function KellyStakingCalculator({
  bankroll,
  onStakeChange,
}: KellyCalculatorProps) {
  const { mode } = useTheme()
  const colors = getColors(mode)
  const [odds, setOdds] = useState<string>('1.85')
  const [probability, setProbability] = useState<string>('0.55')
  const [kellyMethod, setKellyMethod] = useState<'full' | 'half' | 'quarter'>('half')

  // Berechne Kelly Stake
  const calculateStake = useCallback(() => {
    const o = parseFloat(odds)
    const p = parseFloat(probability)

    if (!o || !p || o <= 1 || p <= 0 || p >= 1 || !bankroll) {
      return 0
    }

    const b = o - 1
    const q = 1 - p

    // Kelly: (b*p - q) / b
    let kellyCriterion = (b * p - q) / b

    // Apply Kelly method
    if (kellyMethod === 'half') kellyCriterion = kellyCriterion / 2
    if (kellyMethod === 'quarter') kellyCriterion = kellyCriterion / 4

    // Limit to max 25% bankroll per bet
    kellyCriterion = Math.min(Math.max(kellyCriterion, 0), 0.25)

    return Math.round(bankroll * kellyCriterion * 100) / 100
  }, [odds, probability, kellyMethod, bankroll])

  const stake = calculateStake()

  // Berechne Edge
  const calculateEdge = useCallback(() => {
    const o = parseFloat(odds)
    const p = parseFloat(probability)

    if (!o || !p) return 0

    const bookmakerImplied = 1 / o
    const edge = (p - bookmakerImplied) / bookmakerImplied * 100

    return edge
  }, [odds, probability])

  const edge = calculateEdge()
  const isPositiveEdge = edge > 0

  return (
    <View
      style={{
        backgroundColor: colors.surfaceHigh,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        gap: SPACING.md,
      }}
    >
      {/* Header */}
      <View>
        <Text style={{ ...typography.headingSM, color: colors.text, marginBottom: SPACING.xs }}>
          💰 Kelly Stake Calculator
        </Text>
        <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
          {kellyMethod === 'half'
            ? 'Half-Kelly: Konservativ, sichere Wettgröße'
            : kellyMethod === 'quarter'
              ? 'Quarter-Kelly: Ultra-konservativ'
              : 'Full-Kelly: Aggressiv (nicht empfohlen)'}
        </Text>
      </View>

      {/* Bankroll Display */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: RADIUS.sm,
          padding: SPACING.sm,
        }}
      >
        <Text style={{ ...typography.labelSM, color: colors.textMuted }}>
          Bankroll
        </Text>
        <Text style={{ ...typography.headingMD, color: colors.blue }}>
          €{bankroll.toFixed(2)}
        </Text>
      </View>

      {/* Odds Input */}
      <View>
        <Text style={{ ...typography.labelSM, color: colors.textSecond, marginBottom: SPACING.xs }}>
          Quoten
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surface,
            borderRadius: RADIUS.sm,
            padding: SPACING.sm,
            color: colors.text,
            ...typography.bodyMD,
          }}
          placeholderTextColor={colors.textMuted}
          placeholder="z.B. 1.85"
          value={odds}
          onChangeText={setOdds}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Probability Input */}
      <View>
        <Text style={{ ...typography.labelSM, color: colors.textSecond, marginBottom: SPACING.xs }}>
          Deine Prognose (0.0 - 1.0)
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surface,
            borderRadius: RADIUS.sm,
            padding: SPACING.sm,
            color: colors.text,
            ...typography.bodyMD,
          }}
          placeholderTextColor={colors.textMuted}
          placeholder="z.B. 0.58 = 58%"
          value={probability}
          onChangeText={setProbability}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Kelly Method Selector */}
      <View>
        <Text style={{ ...typography.labelSM, color: colors.textSecond, marginBottom: SPACING.sm }}>
          Kelly-Methode
        </Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          {(['half', 'quarter'] as const).map((method) => (
            <TouchableOpacity
              key={method}
              onPress={() => setKellyMethod(method)}
              style={{
                flex: 1,
                paddingVertical: SPACING.sm,
                paddingHorizontal: SPACING.sm,
                backgroundColor: kellyMethod === method ? colors.blue : colors.surface,
                borderRadius: RADIUS.sm,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.labelSM,
                  color: kellyMethod === method ? colors.text : colors.textSecond,
                }}
              >
                {method === 'half' ? 'Half' : 'Quarter'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Edge Display */}
      <View
        style={{
          backgroundColor: isPositiveEdge ? `${colors.green}15` : `${colors.red}15`,
          borderRadius: RADIUS.sm,
          padding: SPACING.sm,
          borderLeftWidth: 3,
          borderLeftColor: isPositiveEdge ? colors.green : colors.red,
        }}
      >
        <Text style={{ ...typography.labelSM, color: colors.textMuted }}>
          Expected Value (Edge)
        </Text>
        <Text
          style={{
            ...typography.headingMD,
            color: isPositiveEdge ? colors.green : colors.red,
          }}
        >
          {isPositiveEdge ? '+' : ''}{edge.toFixed(2)}%
        </Text>
        <Text style={{ ...typography.bodySM, color: colors.textSecond, marginTop: SPACING.xs }}>
          {isPositiveEdge
            ? '✓ Value Bet! Positive Erwartung'
            : '⚠ Negative Erwartung - nicht empfohlen'}
        </Text>
      </View>

      {/* Recommended Stake */}
      <View
        style={{
          backgroundColor: `${colors.blue}15`,
          borderRadius: RADIUS.sm,
          padding: SPACING.md,
          borderLeftWidth: 3,
          borderLeftColor: colors.blue,
        }}
      >
        <Text style={{ ...typography.labelSM, color: colors.textMuted, marginBottom: SPACING.xs }}>
          Empfohlene Einsatzgröße ({kellyMethod === 'half' ? 'Half' : 'Quarter'}-Kelly)
        </Text>
        <Text style={{ ...typography.headingLG, color: colors.blue, marginBottom: SPACING.sm }}>
          €{stake.toFixed(2)}
        </Text>
        <Text style={{ ...typography.bodySM, color: colors.textSecond }}>
          {stake === 0
            ? 'Ungültige Eingaben oder keine positive Erwartung'
            : stake > bankroll * 0.25
              ? '📌 Max. 25% Bankroll pro Wette erreicht'
              : `💡 ${(stake / bankroll * 100).toFixed(1)}% deiner Bankroll`}
        </Text>
      </View>

      {/* Info Box */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: RADIUS.sm,
          padding: SPACING.sm,
        }}
      >
        <Text style={{ ...typography.bodySM, color: colors.textMuted }}>
          📚 Kelly = ({(parseFloat(odds) - 1).toFixed(2)} × {(parseFloat(probability) * 100).toFixed(0)}% - {(100 - parseFloat(probability) * 100).toFixed(0)}%) ÷ {(parseFloat(odds) - 1).toFixed(2)}
        </Text>
      </View>

      {/* Action Button */}
      {stake > 0 && isPositiveEdge && (
        <TouchableOpacity
          onPress={() => onStakeChange?.(stake)}
          style={{
            backgroundColor: colors.green,
            borderRadius: RADIUS.md,
            paddingVertical: SPACING.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...typography.labelLG,
              color: colors.text,
            }}
          >
            ✓ Diese Wette platzieren (€{stake.toFixed(2)})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
