import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import StatCard from '../components/StatCard';
import SessionCard from '../components/SessionCard';
import colors from '../theme/colors';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatShortDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function HomeScreen({ navigation }) {
  const {
    sessions,
    loading,
    getWeekSessions,
    getMonthSessions,
    getCurrentStreak,
    deleteSession,
  } = useWorkout();

  const weekSessions = useMemo(() => getWeekSessions(0), [sessions]);
  const monthSessions = useMemo(() => getMonthSessions(0), [sessions]);
  const streak = useMemo(() => getCurrentStreak(), [sessions]);
  const lastSession = sessions.length > 0 ? sessions[0] : null;

  const totalVolume = useMemo(() => {
    return sessions.reduce((total, session) => {
      return (
        total +
        session.exercises.reduce((st, exercise) => {
          return (
            st +
            exercise.sets.reduce((et, set) => {
              return set.completed ? et + set.weight * set.reps : et;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }, [sessions]);

  const formattedVolume = useMemo(() => {
    if (totalVolume >= 1000000) return `${(totalVolume / 1000000).toFixed(1)}M`;
    if (totalVolume >= 1000) return `${(totalVolume / 1000).toFixed(0)}k`;
    return `${totalVolume}`;
  }, [totalVolume]);

  const handleDeleteSession = (id) => deleteSession(id);

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()} 💪</Text>
              <Text style={styles.appTitle}>Muscu KeepCool</Text>
              <Text style={styles.appSubtitle}>Tableau de bord</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.keepCoolBadge}>
                <Text style={styles.keepCoolText}>KC</Text>
              </View>
            </View>
          </View>

          {/* Streak Banner */}
          {streak > 0 && (
            <LinearGradient
              colors={['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.streakBanner}
            >
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>
                {streak} jour{streak > 1 ? 's' : ''} de suite – continue comme ça !
              </Text>
            </LinearGradient>
          )}
        </LinearGradient>

        {/* Main Stats Row */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            <StatCard
              title="Cette semaine"
              value={weekSessions.length}
              subtitle={`séance${weekSessions.length > 1 ? 's' : ''}`}
              icon="📅"
              gradient={['#1A1A2E', '#0F2A3E']}
              style={styles.statCardHalf}
            />
            <StatCard
              title="Ce mois"
              value={monthSessions.length}
              subtitle={`séance${monthSessions.length > 1 ? 's' : ''}`}
              icon="📊"
              gradient={['#1A2E1A', '#0F3020']}
              style={styles.statCardHalf}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Total séances"
              value={sessions.length}
              subtitle="depuis le début"
              icon="🏋️"
              gradient={['#2E1A1A', '#3E200F']}
              style={styles.statCardHalf}
            />
            <StatCard
              title="Série actuelle"
              value={streak}
              subtitle={streak > 0 ? `jour${streak > 1 ? 's' : ''} consécutif${streak > 1 ? 's' : ''}` : 'Pas de série'}
              icon="🔥"
              gradient={streak > 0 ? ['#2E1A00', '#4A2800'] : ['#1A1A2E', '#1A1A2E']}
              style={styles.statCardHalf}
            />
          </View>
        </View>

        {/* Volume Total */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#0F2040', '#0A0A1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.volumeCard}
          >
            <View style={styles.volumeLeft}>
              <Text style={styles.volumeIcon}>⚡</Text>
              <View>
                <Text style={styles.volumeLabel}>Volume Total Soulevé</Text>
                <Text style={styles.volumeSubLabel}>Toutes séances confondues</Text>
              </View>
            </View>
            <View style={styles.volumeRight}>
              <Text style={styles.volumeValue}>{formattedVolume}</Text>
              <Text style={styles.volumeUnit}>kg</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Action */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewSession')}
          >
            <LinearGradient
              colors={[colors.primaryDark, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newSessionBtn}
            >
              <Ionicons name="add-circle" size={24} color={colors.textWhite} />
              <Text style={styles.newSessionBtnText}>Nouvelle Séance</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Weekly Progress Dots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cette semaine</Text>
          <WeekProgress weekSessions={weekSessions} />
        </View>

        {/* Last Session */}
        {lastSession && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dernière séance</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Séances')}>
                <Text style={styles.seeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>
            <SessionCard
              session={lastSession}
              onPress={() =>
                navigation.navigate('SessionDetail', { sessionId: lastSession.id })
              }
              onDelete={handleDeleteSession}
            />
          </View>
        )}

        {/* CABLEQUAD Quick Stats */}
        <CableQuadSummary sessions={sessions} navigation={navigation} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekProgress({ weekSessions }) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const sessionsByDay = days.map((_, idx) => {
    return weekSessions.some((s) => {
      const d = new Date(s.date);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      return dayIdx === idx;
    });
  });

  return (
    <LinearGradient
      colors={['#1A1A2E', '#0F1A2E']}
      style={styles.weekCard}
    >
      <View style={styles.weekDays}>
        {days.map((day, idx) => {
          const isToday = idx === todayIdx;
          const hasSession = sessionsByDay[idx];
          return (
            <View key={day} style={styles.dayItem}>
              <View
                style={[
                  styles.dayDot,
                  hasSession && styles.dayDotActive,
                  isToday && styles.dayDotToday,
                ]}
              >
                {hasSession && (
                  <Text style={styles.dayCheck}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelToday,
                  hasSession && styles.dayLabelActive,
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.weekCount}>
        {weekSessions.length} séance{weekSessions.length > 1 ? 's' : ''} cette semaine
      </Text>
    </LinearGradient>
  );
}

function CableQuadSummary({ sessions, navigation }) {
  const cableSessions = useMemo(() => {
    return sessions.filter((s) =>
      s.exercises.some((e) => e.machineName === 'CABLEQUAD')
    );
  }, [sessions]);

  if (cableSessions.length === 0) return null;

  const lastCable = cableSessions[0];
  const cableExercise = lastCable.exercises.find((e) => e.machineName === 'CABLEQUAD');
  const maxWeight = cableExercise
    ? Math.max(...cableExercise.sets.map((s) => s.weight))
    : 0;

  const allCableSets = cableSessions.flatMap((s) =>
    s.exercises
      .filter((e) => e.machineName === 'CABLEQUAD')
      .flatMap((e) => e.sets.filter((st) => st.completed))
  );
  const bestEver = allCableSets.length > 0
    ? Math.max(...allCableSets.map((s) => s.weight))
    : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ CABLEQUAD</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CABLEQUAD')}>
          <Text style={styles.seeAll}>Détails →</Text>
        </TouchableOpacity>
      </View>
      <LinearGradient
        colors={['#1A1A2E', '#0F2040']}
        style={styles.cableCard}
      >
        <View style={styles.cableStats}>
          <View style={styles.cableStat}>
            <Text style={styles.cableStatValue}>{cableSessions.length}</Text>
            <Text style={styles.cableStatLabel}>séances</Text>
          </View>
          <View style={styles.cableStatDivider} />
          <View style={styles.cableStat}>
            <Text style={styles.cableStatValue}>{maxWeight}kg</Text>
            <Text style={styles.cableStatLabel}>dernière séance</Text>
          </View>
          <View style={styles.cableStatDivider} />
          <View style={styles.cableStat}>
            <Text style={[styles.cableStatValue, { color: colors.success }]}>{bestEver}kg</Text>
            <Text style={styles.cableStatLabel}>record</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  keepCoolBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepCoolText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textWhite,
    letterSpacing: 1,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
    gap: 8,
  },
  streakFire: {
    fontSize: 18,
  },
  streakText: {
    fontSize: 13,
    color: colors.secondaryLight,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCardHalf: {
    flex: 1,
  },
  volumeCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  volumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeIcon: {
    fontSize: 32,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
  },
  volumeSubLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
  },
  volumeRight: {
    alignItems: 'flex-end',
  },
  volumeValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  volumeUnit: {
    fontSize: 13,
    color: colors.textSub,
    textAlign: 'right',
  },
  newSessionBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  newSessionBtnText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  weekCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.chartBarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayDotToday: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  dayCheck: {
    fontSize: 14,
    color: colors.textWhite,
    fontWeight: '700',
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayLabelToday: {
    color: colors.secondary,
  },
  dayLabelActive: {
    color: colors.primary,
  },
  weekCount: {
    fontSize: 12,
    color: colors.textSub,
    textAlign: 'center',
  },
  cableCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  cableStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cableStat: {
    alignItems: 'center',
  },
  cableStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  cableStatLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
    textAlign: 'center',
  },
  cableStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  bottomSpacer: {
    height: 20,
  },
});
