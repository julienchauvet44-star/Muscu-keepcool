import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import MiniBarChart from '../components/MiniBarChart';
import colors from '../theme/colors';

function formatShortDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const label = d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getDaysAgo(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff}j`;
  if (diff < 30) return `Il y a ${Math.floor(diff / 7)}sem`;
  return `Il y a ${Math.floor(diff / 30)}mois`;
}

export default function CableQuadScreen({ navigation }) {
  const { getCableQuadSessions } = useWorkout();

  const cableSessions = useMemo(() => getCableQuadSessions(), [getCableQuadSessions]);

  // Sorted desc for display
  const sessionsSortedDesc = useMemo(
    () => [...cableSessions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [cableSessions]
  );

  // Stats
  const stats = useMemo(() => {
    if (cableSessions.length === 0) {
      return {
        bestWeight: 0,
        bestReps: 0,
        bestDate: null,
        lastWeight: 0,
        lastReps: 0,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        avgWeight: 0,
      };
    }

    let bestWeight = 0;
    let bestReps = 0;
    let bestDate = null;
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    const allWeights = [];

    cableSessions.forEach((session) => {
      const cableEx = session.exercises.find((e) => e.machineName === 'CABLEQUAD');
      if (!cableEx) return;
      cableEx.sets.forEach((set) => {
        if (!set.completed) return;
        totalSets++;
        totalReps += set.reps;
        totalVolume += set.weight * set.reps;
        allWeights.push(set.weight);
        if (set.weight > bestWeight || (set.weight === bestWeight && set.reps > bestReps)) {
          bestWeight = set.weight;
          bestReps = set.reps;
          bestDate = session.date;
        }
      });
    });

    const lastSession = sessionsSortedDesc[0];
    const lastEx = lastSession?.exercises.find((e) => e.machineName === 'CABLEQUAD');
    const lastCompletedSets = lastEx?.sets.filter((s) => s.completed) || [];
    const lastWeight = lastCompletedSets.length > 0
      ? Math.max(...lastCompletedSets.map((s) => s.weight))
      : 0;
    const lastReps = lastCompletedSets.length > 0
      ? lastCompletedSets[lastCompletedSets.length - 1].reps
      : 0;

    const avgWeight =
      allWeights.length > 0
        ? Math.round(allWeights.reduce((a, b) => a + b, 0) / allWeights.length)
        : 0;

    return {
      bestWeight,
      bestReps,
      bestDate,
      lastWeight,
      lastReps,
      totalSets,
      totalReps,
      totalVolume,
      avgWeight,
    };
  }, [cableSessions]);

  // Chart data: last 15 sessions, max weight per session
  const chartData = useMemo(() => {
    const last15 = cableSessions.slice(-15);
    return {
      weights: last15.map((s) => {
        const ex = s.exercises.find((e) => e.machineName === 'CABLEQUAD');
        if (!ex) return 0;
        const completed = ex.sets.filter((st) => st.completed);
        return completed.length > 0 ? Math.max(...completed.map((st) => st.weight)) : 0;
      }),
      labels: last15.map((s) => formatShortDate(s.date)),
      volumes: last15.map((s) => {
        const ex = s.exercises.find((e) => e.machineName === 'CABLEQUAD');
        if (!ex) return 0;
        return ex.sets
          .filter((st) => st.completed)
          .reduce((t, st) => t + st.weight * st.reps, 0);
      }),
    };
  }, [cableSessions]);

  // Trend
  const trend = useMemo(() => {
    if (chartData.weights.length < 3) return null;
    const recent = chartData.weights.slice(-3);
    const older = chartData.weights.slice(-6, -3);
    if (older.length === 0) return null;
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 1) return { type: 'stable', diff: 0 };
    return { type: diff > 0 ? 'up' : 'down', diff: Math.abs(diff).toFixed(1) };
  }, [chartData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#0F1A2E', '#0A0A1F']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerIcon}>⚡</Text>
                <Text style={styles.headerTitle}>CABLEQUAD</Text>
              </View>
              <Text style={styles.headerSub}>Extension quadriceps câble</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeSessions}>{cableSessions.length}</Text>
              <Text style={styles.headerBadgeLabel}>séances</Text>
            </View>
          </View>

          {/* Trend indicator */}
          {trend && (
            <View
              style={[
                styles.trendBadge,
                trend.type === 'up' && styles.trendBadgeUp,
                trend.type === 'down' && styles.trendBadgeDown,
                trend.type === 'stable' && styles.trendBadgeStable,
              ]}
            >
              <Ionicons
                name={
                  trend.type === 'up'
                    ? 'trending-up'
                    : trend.type === 'down'
                    ? 'trending-down'
                    : 'remove'
                }
                size={16}
                color={
                  trend.type === 'up'
                    ? colors.success
                    : trend.type === 'down'
                    ? colors.error
                    : colors.warning
                }
              />
              <Text
                style={[
                  styles.trendText,
                  trend.type === 'up' && { color: colors.success },
                  trend.type === 'down' && { color: colors.error },
                  trend.type === 'stable' && { color: colors.warning },
                ]}
              >
                {trend.type === 'up'
                  ? `+${trend.diff}kg sur les 3 dernières séances`
                  : trend.type === 'down'
                  ? `-${trend.diff}kg sur les 3 dernières séances`
                  : 'Stable sur les dernières séances'}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Personal Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Records personnels</Text>
          <View style={styles.recordsRow}>
            <LinearGradient
              colors={['#0F2040', '#0A0A1F']}
              style={styles.recordCard}
            >
              <Text style={styles.recordIcon}>🏆</Text>
              <Text style={styles.recordValue}>{stats.bestWeight}kg</Text>
              <Text style={styles.recordLabel}>Meilleur poids</Text>
              {stats.bestDate && (
                <Text style={styles.recordDate}>{formatShortDate(stats.bestDate)}</Text>
              )}
            </LinearGradient>

            <LinearGradient
              colors={['#1A2E0F', '#0A1A0A']}
              style={styles.recordCard}
            >
              <Text style={styles.recordIcon}>🔄</Text>
              <Text style={[styles.recordValue, { color: colors.success }]}>
                {stats.bestReps}
              </Text>
              <Text style={styles.recordLabel}>Reps record</Text>
              <Text style={styles.recordDate}>à {stats.bestWeight}kg</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#2E1A0F', '#1A0A0A']}
              style={styles.recordCard}
            >
              <Text style={styles.recordIcon}>📈</Text>
              <Text style={[styles.recordValue, { color: colors.secondary }]}>
                {stats.lastWeight}kg
              </Text>
              <Text style={styles.recordLabel}>Dernière séance</Text>
              <Text style={styles.recordDate}>{stats.lastReps} reps</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Aggregated Stats */}
        <View style={styles.section}>
          <View style={styles.aggStatsGrid}>
            <AggStat label="Séries totales" value={stats.totalSets} icon="🔢" />
            <AggStat label="Reps totales" value={stats.totalReps} icon="🔄" />
            <AggStat
              label="Volume total"
              value={
                stats.totalVolume >= 1000
                  ? `${(stats.totalVolume / 1000).toFixed(1)}t`
                  : `${stats.totalVolume}kg`
              }
              icon="⚡"
              color={colors.primary}
            />
            <AggStat label="Poids moyen" value={`${stats.avgWeight}kg`} icon="📊" />
          </View>
        </View>

        {/* Weight Progression Chart */}
        {chartData.weights.length > 1 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['#1A1A2E', '#0F1A2E']}
              style={styles.chartCard}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Progression du poids max</Text>
                <Text style={styles.chartSubtitle}>
                  {chartData.weights.length} dernières séances
                </Text>
              </View>
              <MiniBarChart
                data={chartData.weights}
                labels={chartData.labels}
                barColor={colors.primary}
                height={130}
                showValues
                unit="kg"
                style={styles.chart}
              />
            </LinearGradient>
          </View>
        )}

        {/* Volume Chart */}
        {chartData.volumes.length > 1 && (
          <View style={styles.section}>
            <LinearGradient
              colors={['#1A1A2E', '#0F1A2E']}
              style={styles.chartCard}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Volume par séance (kg)</Text>
                <Text style={styles.chartSubtitle}>Poids × reps cumulés</Text>
              </View>
              <MiniBarChart
                data={chartData.volumes}
                labels={chartData.labels}
                barColor={colors.secondary}
                height={110}
                showValues={false}
                unit=""
                style={styles.chart}
              />
            </LinearGradient>
          </View>
        )}

        {/* Add New Session Button */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewSession', { machine: 'CABLEQUAD' })}
          >
            <LinearGradient
              colors={[colors.primaryDark, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addSessionBtn}
            >
              <Ionicons name="add-circle" size={24} color={colors.textWhite} />
              <View style={styles.addSessionBtnText}>
                <Text style={styles.addSessionBtnTitle}>Nouvelle séance CABLEQUAD</Text>
                <Text style={styles.addSessionBtnSub}>Enregistrer une séance</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Sessions */}
        {sessionsSortedDesc.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historique CABLEQUAD</Text>
            {sessionsSortedDesc.map((session) => (
              <CableSessionRow key={session.id} session={session} />
            ))}
          </View>
        )}

        {cableSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚡</Text>
            <Text style={styles.emptyTitle}>Aucune séance CABLEQUAD</Text>
            <Text style={styles.emptyText}>
              Commence ta première séance pour voir ta progression ici !
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AggStat({ label, value, icon, color }) {
  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F1A2E']}
      style={styles.aggStatCard}
    >
      <Text style={styles.aggStatIcon}>{icon}</Text>
      <Text style={[styles.aggStatValue, color && { color }]}>{value}</Text>
      <Text style={styles.aggStatLabel}>{label}</Text>
    </LinearGradient>
  );
}

function CableSessionRow({ session }) {
  const cableEx = session.exercises.find((e) => e.machineName === 'CABLEQUAD');
  if (!cableEx) return null;

  const completedSets = cableEx.sets.filter((s) => s.completed);
  const maxWeight = completedSets.length > 0
    ? Math.max(...completedSets.map((s) => s.weight))
    : 0;
  const totalVolume = completedSets.reduce((t, s) => t + s.weight * s.reps, 0);

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F2040']}
      style={styles.cableSessionRow}
    >
      <View style={styles.cableSessionLeft}>
        <Text style={styles.cableSessionDate}>{formatDate(session.date)}</Text>
        <Text style={styles.cableSessionAgo}>{getDaysAgo(session.date)}</Text>
      </View>

      <View style={styles.cableSessionSets}>
        {cableEx.sets.map((set, idx) => (
          <View
            key={set.id || idx}
            style={[
              styles.cableSetPill,
              set.completed && styles.cableSetPillActive,
            ]}
          >
            <Text
              style={[
                styles.cableSetPillText,
                set.completed && styles.cableSetPillTextActive,
              ]}
            >
              {set.weight}×{set.reps}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cableSessionRight}>
        <Text style={styles.cableMaxWeight}>{maxWeight}kg</Text>
        <Text style={styles.cableVolume}>{totalVolume}kg</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textSub,
    fontStyle: 'italic',
  },
  headerBadge: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  headerBadgeSessions: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  headerBadgeLabel: {
    fontSize: 10,
    color: colors.textSub,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  trendBadgeUp: {
    backgroundColor: 'rgba(0,230,118,0.1)',
    borderColor: colors.success + '40',
  },
  trendBadgeDown: {
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderColor: colors.error + '40',
  },
  trendBadgeStable: {
    backgroundColor: 'rgba(255,215,64,0.1)',
    borderColor: colors.warning + '40',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 12,
  },
  recordsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recordCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  recordLabel: {
    fontSize: 10,
    color: colors.textSub,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  aggStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aggStatCard: {
    width: '47.5%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aggStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  aggStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textWhite,
  },
  aggStatLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
  chartSubtitle: {
    fontSize: 11,
    color: colors.textSub,
  },
  chart: {
    marginTop: 4,
  },
  addSessionBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addSessionBtnText: {
    flex: 1,
  },
  addSessionBtnTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
  },
  addSessionBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  cableSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cableSessionLeft: {
    width: 80,
  },
  cableSessionDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textWhite,
  },
  cableSessionAgo: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  cableSessionSets: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cableSetPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cableSetPillActive: {
    backgroundColor: 'rgba(79,195,247,0.1)',
    borderColor: colors.primary + '60',
  },
  cableSetPillText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cableSetPillTextActive: {
    color: colors.primary,
  },
  cableSessionRight: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  cableMaxWeight: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  cableVolume: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
