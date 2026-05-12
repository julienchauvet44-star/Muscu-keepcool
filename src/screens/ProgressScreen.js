import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import MiniBarChart from '../components/MiniBarChart';
import colors from '../theme/colors';

const MONTH_NAMES_FR = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

function getWeekLabel(weekOffset) {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - day - weekOffset * 7);
  if (weekOffset === 0) return 'Cette\nsem.';
  if (weekOffset === 1) return 'Sem.\ndern.';
  return `${start.getDate()}/${start.getMonth() + 1}`;
}

function getMonthLabel(monthOffset) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  return MONTH_NAMES_FR[date.getMonth()];
}

function formatShortDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function ProgressScreen() {
  const { sessions, getWeekSessions, getMonthSessions, getTotalVolume, getPersonalRecords } =
    useWorkout();

  // Weekly sessions count (last 8 weeks)
  const weeklyCounts = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => getWeekSessions(7 - i).length);
  }, [sessions]);

  const weeklyLabels = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => getWeekLabel(7 - i));
  }, []);

  // Monthly sessions count (last 6 months)
  const monthlyCounts = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => getMonthSessions(5 - i).length);
  }, [sessions]);

  const monthlyLabels = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => getMonthLabel(5 - i));
  }, []);

  // Monthly volumes
  const monthlyVolumes = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const monthSessions = getMonthSessions(5 - i);
      return monthSessions.reduce(
        (total, session) =>
          total +
          session.exercises.reduce(
            (st, ex) =>
              st +
              ex.sets.reduce((et, set) => (set.completed ? et + set.weight * set.reps : et), 0),
            0
          ),
        0
      );
    });
  }, [sessions]);

  const totalVolume = useMemo(() => getTotalVolume(), [sessions]);
  const personalRecords = useMemo(() => getPersonalRecords(), [sessions]);

  // Volume per session for the last 10 sessions
  const sessionVolumes = useMemo(() => {
    return sessions.slice(0, 10).reverse().map((s) =>
      s.exercises.reduce(
        (total, ex) =>
          total +
          ex.sets.reduce((et, set) => (set.completed ? et + set.weight * set.reps : et), 0),
        0
      )
    );
  }, [sessions]);
  const sessionVolumeLabels = useMemo(() => {
    return sessions.slice(0, 10).reverse().map((s) => formatShortDate(s.date));
  }, [sessions]);

  // Global stats
  const totalSessions = sessions.length;
  const avgDuration = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(
      sessions.reduce((t, s) => t + (s.durationMinutes || 0), 0) / sessions.length
    );
  }, [sessions]);

  const totalExercises = useMemo(() => {
    return sessions.reduce((t, s) => t + s.exercises.length, 0);
  }, [sessions]);

  const formattedVolume = useMemo(() => {
    if (totalVolume >= 1000000) return `${(totalVolume / 1000000).toFixed(2)}M kg`;
    if (totalVolume >= 1000) return `${(totalVolume / 1000).toFixed(1)} t`;
    return `${totalVolume} kg`;
  }, [totalVolume]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#0F1A2E', '#0A0A0F']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Progrès</Text>
          <Text style={styles.headerSub}>Statistiques & évolution</Text>
        </LinearGradient>

        {/* Global Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue globale</Text>
          <View style={styles.globalRow}>
            <GlobalStatCard
              icon="🏋️"
              value={totalSessions}
              label="Séances totales"
              gradient={['#0F2040', '#0A0A1F']}
            />
            <GlobalStatCard
              icon="⏱"
              value={`${avgDuration}min`}
              label="Durée moy."
              gradient={['#1A2E0F', '#0A1A0A']}
            />
          </View>
          <View style={styles.globalRow}>
            <GlobalStatCard
              icon="💪"
              value={totalExercises}
              label="Exercices logués"
              gradient={['#2E0F2E', '#1A0A1A']}
            />
            <GlobalStatCard
              icon="⚡"
              value={formattedVolume}
              label="Volume total"
              gradient={['#2E1A0F', '#1A0A0A']}
              valueSmall
            />
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.section}>
          <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.chartCard}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.chartTitle}>Séances par semaine</Text>
            </View>
            <Text style={styles.chartSubtitle}>8 dernières semaines</Text>
            <MiniBarChart
              data={weeklyCounts}
              labels={weeklyLabels}
              barColor={colors.primary}
              height={140}
              showValues
              unit=""
              style={styles.chartStyle}
            />
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Moy: {(weeklyCounts.reduce((a, b) => a + b, 0) / weeklyCounts.filter(v => v > 0).length || 0).toFixed(1)} séances/semaine active
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Monthly Bar Chart */}
        <View style={styles.section}>
          <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.chartCard}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="bar-chart-outline" size={16} color={colors.success} />
              <Text style={styles.chartTitle}>Séances par mois</Text>
            </View>
            <Text style={styles.chartSubtitle}>6 derniers mois</Text>
            <MiniBarChart
              data={monthlyCounts}
              labels={monthlyLabels}
              barColor={colors.success}
              height={130}
              showValues
              unit=""
              style={styles.chartStyle}
            />
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Total: {monthlyCounts.reduce((a, b) => a + b, 0)} séances
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Monthly Volume Chart */}
        <View style={styles.section}>
          <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.chartCard}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="trending-up-outline" size={16} color={colors.secondary} />
              <Text style={styles.chartTitle}>Volume mensuel (kg)</Text>
            </View>
            <Text style={styles.chartSubtitle}>Somme poids × reps</Text>
            <MiniBarChart
              data={monthlyVolumes}
              labels={monthlyLabels}
              barColor={colors.secondary}
              height={120}
              showValues={false}
              style={styles.chartStyle}
            />
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Ce mois: {monthlyVolumes[monthlyVolumes.length - 1] >= 1000
                  ? `${(monthlyVolumes[monthlyVolumes.length - 1] / 1000).toFixed(1)}t`
                  : `${monthlyVolumes[monthlyVolumes.length - 1]}kg`}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Volume per session */}
        {sessionVolumes.length > 1 && (
          <View style={styles.section}>
            <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.chartCard}>
              <View style={styles.chartTitleRow}>
                <Ionicons name="flash-outline" size={16} color={colors.warning} />
                <Text style={styles.chartTitle}>Volume par séance</Text>
              </View>
              <Text style={styles.chartSubtitle}>10 dernières séances</Text>
              <MiniBarChart
                data={sessionVolumes}
                labels={sessionVolumeLabels}
                barColor={colors.warning}
                height={120}
                showValues={false}
                style={styles.chartStyle}
              />
            </LinearGradient>
          </View>
        )}

        {/* Personal Records */}
        {Object.keys(personalRecords).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Records par machine 🏆</Text>
            {Object.entries(personalRecords)
              .sort((a, b) => b[1].weight - a[1].weight)
              .map(([machine, record]) => (
                <PersonalRecordRow key={machine} machine={machine} record={record} />
              ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GlobalStatCard({ icon, value, label, gradient, valueSmall }) {
  return (
    <LinearGradient
      colors={gradient}
      style={styles.globalStatCard}
    >
      <Text style={styles.globalStatIcon}>{icon}</Text>
      <Text style={[styles.globalStatValue, valueSmall && styles.globalStatValueSmall]}>
        {value}
      </Text>
      <Text style={styles.globalStatLabel}>{label}</Text>
    </LinearGradient>
  );
}

function PersonalRecordRow({ machine, record }) {
  const machineColors = {
    CABLEQUAD: colors.primary,
    PRESSE: colors.secondary,
    TIRAGE: colors.success,
    'DÉVELOPPÉ COUCHÉ': colors.purple,
    'CURL BICEPS': colors.teal,
    'EXTENSION TRICEPS': colors.warning,
  };
  const color = machineColors[machine] || colors.textSub;

  const d = new Date(record.date);
  const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' });

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F1A2E']}
      style={styles.prRow}
    >
      <View style={[styles.prColorBar, { backgroundColor: color }]} />
      <View style={styles.prLeft}>
        <Text style={[styles.prMachine, { color }]}>{machine}</Text>
        <Text style={styles.prDate}>{dateStr}</Text>
      </View>
      <View style={styles.prRight}>
        <Text style={[styles.prWeight, { color }]}>{record.weight}kg</Text>
        <Text style={styles.prReps}>× {record.reps} reps</Text>
      </View>
      <View style={styles.prVolume}>
        <Text style={styles.prVolumeValue}>
          {record.weight * record.reps}
        </Text>
        <Text style={styles.prVolumeLabel}>vol.</Text>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
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
  globalRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  globalStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  globalStatIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  globalStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textWhite,
    textAlign: 'center',
  },
  globalStatValueSmall: {
    fontSize: 16,
  },
  globalStatLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
  chartSubtitle: {
    fontSize: 11,
    color: colors.textSub,
    marginBottom: 12,
  },
  chartStyle: {
    marginTop: 4,
  },
  chartFooter: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  chartFooterText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    overflow: 'hidden',
  },
  prColorBar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  prLeft: {
    flex: 1,
    marginLeft: 6,
  },
  prMachine: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  prDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  prRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  prWeight: {
    fontSize: 18,
    fontWeight: '800',
  },
  prReps: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 1,
  },
  prVolume: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
  },
  prVolumeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
  },
  prVolumeLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
