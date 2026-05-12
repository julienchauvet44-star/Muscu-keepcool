import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function MiniBarChart({
  data,
  labels,
  barColor,
  secondaryColor,
  height = 120,
  showValues = true,
  showLabels = true,
  title,
  unit = '',
  style,
}) {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { height }, style]}>
        <Text style={styles.emptyText}>Pas de données</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data, 1);
  const activeBarColor = barColor || colors.primary;

  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.chartTitle}>{title}</Text> : null}
      <View style={[styles.chart, { height }]}>
        {/* Grid lines */}
        <View style={styles.gridLines}>
          {[0.25, 0.5, 0.75, 1].map((factor) => (
            <View
              key={factor}
              style={[
                styles.gridLine,
                { bottom: `${factor * 100}%` },
              ]}
            />
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((value, index) => {
            const percentage = value > 0 ? (value / maxValue) * 100 : 0;
            const isLast = index === data.length - 1;
            const barCol = isLast && secondaryColor ? secondaryColor : activeBarColor;

            return (
              <View key={index} style={styles.barWrapper}>
                {showValues && value > 0 && (
                  <Text style={[styles.barValue, { color: barCol }]}>
                    {value}{unit}
                  </Text>
                )}
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${percentage}%`,
                        backgroundColor: barCol,
                        opacity: isLast ? 1 : 0.7,
                      },
                    ]}
                  />
                </View>
                {showLabels && labels && labels[index] ? (
                  <Text style={styles.label} numberOfLines={1}>
                    {labels[index]}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function LineChart({
  data,
  labels,
  lineColor,
  height = 120,
  showValues = false,
  showLabels = true,
  title,
  unit = '',
  style,
}) {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { height }, style]}>
        <Text style={styles.emptyText}>Pas assez de données</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  const activeColor = lineColor || colors.primary;

  const normalizedPoints = data.map((v) => 1 - (v - minValue) / range);

  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.chartTitle}>{title}</Text> : null}
      <View style={[styles.chart, { height }]}>
        <View style={styles.gridLines}>
          {[0.25, 0.5, 0.75, 1].map((factor) => (
            <View
              key={factor}
              style={[styles.gridLine, { bottom: `${factor * 100}%` }]}
            />
          ))}
        </View>

        <View style={styles.lineContainer}>
          {normalizedPoints.map((norm, index) => {
            const value = data[index];
            const isFirst = index === 0;
            const prevNorm = isFirst ? norm : normalizedPoints[index - 1];

            return (
              <View
                key={index}
                style={[
                  styles.linePoint,
                  {
                    top: `${norm * 85}%`,
                    left: `${(index / (data.length - 1)) * 90 + 5}%`,
                  },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: activeColor }]} />
                {showValues && (
                  <Text style={[styles.dotValue, { color: activeColor }]}>
                    {value}{unit}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {showLabels && labels && (
          <View style={styles.lineLabels}>
            {labels.map((label, index) => (
              <Text key={index} style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartTitle: {
    fontSize: 13,
    color: colors.textSub,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chart: {
    position: 'relative',
    width: '100%',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.chartGrid,
    opacity: 0.5,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
    height: '100%',
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barBackground: {
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.chartBarBg,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
  },
  linePoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  dotValue: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  lineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chartBarBg,
    borderRadius: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
