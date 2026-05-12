import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import colors from '../theme/colors';

const MACHINE_COLORS = {
  CABLEQUAD: colors.primary,
  PRESSE: colors.secondary,
  TIRAGE: colors.success,
  'DÉVELOPPÉ COUCHÉ': colors.purple,
  'CURL BICEPS': colors.teal,
  'EXTENSION TRICEPS': colors.warning,
  ÉPAULES: colors.secondary,
  ABDOS: colors.success,
  CARDIO: colors.error,
};

const MACHINE_ICONS = {
  CABLEQUAD: '⚡',
  PRESSE: '🦵',
  TIRAGE: '💪',
  'DÉVELOPPÉ COUCHÉ': '🏋️',
  'CURL BICEPS': '💪',
  'EXTENSION TRICEPS': '🔱',
  ÉPAULES: '🔝',
  ABDOS: '🔢',
  CARDIO: '🏃',
};

function formatFullDate(isoString) {
  const d = new Date(isoString);
  const label = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SessionDetailScreen({ navigation, route }) {
  const { sessionId } = route.params;
  const { sessions, deleteSession } = useWorkout();

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId]
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Séance introuvable</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = session.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce((st, set) => (set.completed ? st + set.weight * set.reps : st), 0),
    0
  );

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la séance',
      'Êtes-vous sûr de vouloir supprimer cette séance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Header */}
        <LinearGradient
          colors={['#0F2040', '#0A0A0F']}
          style={styles.headerCard}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.dateText}>{formatFullDate(session.date)}</Text>
              <Text style={styles.timeText}>
                {formatTime(session.date)} · {session.durationMinutes} minutes
              </Text>
            </View>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{session.exercises.length}</Text>
              <Text style={styles.statLabel}>exercice{session.exercises.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
              <Text style={styles.statLabel}>séries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${totalVolume}kg`}
              </Text>
              <Text style={styles.statLabel}>volume</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercices</Text>
          {session.exercises.map((exercise, idx) => (
            <ExerciseDetail key={exercise.id} exercise={exercise} index={idx} />
          ))}
        </View>

        {/* Notes */}
        {session.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <LinearGradient
              colors={['#1A1A2E', '#1A1A2E']}
              style={styles.notesCard}
            >
              <Text style={styles.notesText}>{session.notes}</Text>
            </LinearGradient>
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseDetail({ exercise, index }) {
  const color = MACHINE_COLORS[exercise.machineName] || colors.textSub;
  const icon = MACHINE_ICONS[exercise.machineName] || '🏅';

  const completedSets = exercise.sets.filter((s) => s.completed);
  const totalVolume = completedSets.reduce((t, s) => t + s.weight * s.reps, 0);
  const maxWeight = completedSets.length > 0
    ? Math.max(...completedSets.map((s) => s.weight))
    : 0;
  const totalReps = completedSets.reduce((t, s) => t + s.reps, 0);

  return (
    <View style={[styles.exerciseCard, { borderLeftColor: color }]}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseIcon}>{icon}</Text>
        <View style={styles.exerciseTitleWrap}>
          <Text style={[styles.exerciseName, { color }]}>{exercise.machineName}</Text>
          <Text style={styles.exerciseSub}>
            {completedSets.length}/{exercise.sets.length} séries · {totalVolume}kg vol.
          </Text>
        </View>
        <View style={styles.exerciseBadge}>
          <Text style={[styles.exerciseBadgeText, { color }]}>{maxWeight}kg max</Text>
        </View>
      </View>

      {/* Sets table */}
      <View style={styles.setsTable}>
        <View style={styles.setsHeaderRow}>
          <Text style={styles.setsHeaderCell}>#</Text>
          <Text style={styles.setsHeaderCell}>Poids</Text>
          <Text style={styles.setsHeaderCell}>Reps</Text>
          <Text style={styles.setsHeaderCell}>Volume</Text>
          <Text style={styles.setsHeaderCell}>✓</Text>
        </View>
        {exercise.sets.map((set, setIdx) => (
          <View
            key={set.id || setIdx}
            style={[styles.setRow, !set.completed && styles.setRowIncomplete]}
          >
            <Text style={styles.setCell}>{setIdx + 1}</Text>
            <Text style={[styles.setCell, styles.setCellValue]}>{set.weight}kg</Text>
            <Text style={[styles.setCell, styles.setCellValue]}>{set.reps}</Text>
            <Text style={[styles.setCell, { color: colors.success }]}>
              {set.completed ? set.weight * set.reps + 'kg' : '-'}
            </Text>
            <View style={styles.setCell}>
              <View
                style={[
                  styles.checkDot,
                  set.completed && { backgroundColor: color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {exercise.notes ? (
        <Text style={styles.exerciseNotes}>💬 {exercise.notes}</Text>
      ) : null}
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
  headerCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 3,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textWhite,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  exerciseIcon: {
    fontSize: 24,
  },
  exerciseTitleWrap: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseSub: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
  },
  exerciseBadge: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  exerciseBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  setsTable: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  setsHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setsHeaderCell: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
    alignItems: 'center',
  },
  setRowIncomplete: {
    opacity: 0.45,
  },
  setCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  setCellValue: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  checkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignSelf: 'center',
  },
  exerciseNotes: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 10,
  },
  notesCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: colors.textSub,
    marginBottom: 12,
  },
  backLink: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
