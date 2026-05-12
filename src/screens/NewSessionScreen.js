import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import ExerciseForm from '../components/ExerciseForm';
import colors from '../theme/colors';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isoDateString(date) {
  return date.toISOString();
}

export default function NewSessionScreen({ navigation, route }) {
  const { addSession } = useWorkout();
  const preselectedMachine = route?.params?.machine;

  const [sessionDate, setSessionDate] = useState(new Date());
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState(() => {
    if (preselectedMachine) {
      return [
        {
          id: generateId(),
          machineName: preselectedMachine,
          sets: [
            { id: generateId(), reps: 12, weight: 40, completed: true },
            { id: generateId(), reps: 12, weight: 45, completed: true },
            { id: generateId(), reps: 10, weight: 50, completed: true },
            { id: generateId(), reps: 10, weight: 52, completed: true },
          ],
          notes: '',
        },
      ];
    }
    return [];
  });
  const [saving, setSaving] = useState(false);

  const adjustDate = (delta) => {
    const d = new Date(sessionDate);
    d.setDate(d.getDate() + delta);
    setSessionDate(d);
  };

  const adjustTime = (deltaHours) => {
    const d = new Date(sessionDate);
    d.setHours(d.getHours() + deltaHours);
    setSessionDate(d);
  };

  const handleSave = async () => {
    if (exercises.length === 0) {
      Alert.alert(
        'Aucun exercice',
        'Ajoutez au moins un exercice avant de sauvegarder.',
        [{ text: 'OK' }]
      );
      return;
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < 1) {
      Alert.alert('Durée invalide', 'Entrez une durée en minutes valide.');
      return;
    }

    setSaving(true);
    try {
      await addSession({
        date: sessionDate.toISOString(),
        durationMinutes: duration,
        exercises: exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) => ({ ...s })),
        })),
        notes,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la séance.');
    } finally {
      setSaving(false);
    }
  };

  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0);
  const completedSets = exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date Selector */}
          <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.dateCard}>
            <Text style={styles.sectionLabel}>Date de la séance</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.dateArrow} onPress={() => adjustDate(-1)}>
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.dateCenter}>
                <Text style={styles.dateText}>
                  {formatDisplayDate(sessionDate)}
                </Text>
                <Text style={styles.timeText}>
                  {sessionDate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dateArrow}
                onPress={() => adjustDate(1)}
                disabled={sessionDate >= new Date()}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={sessionDate >= new Date() ? colors.textDisabled : colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.timeAdjustRow}>
              <TouchableOpacity style={styles.timeBtn} onPress={() => adjustTime(-1)}>
                <Text style={styles.timeBtnText}>-1h</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timeBtn} onPress={() => adjustTime(1)}>
                <Text style={styles.timeBtnText}>+1h</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeBtnNow}
                onPress={() => setSessionDate(new Date())}
              >
                <Text style={styles.timeBtnNowText}>Maintenant</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Duration */}
          <LinearGradient colors={['#1A1A2E', '#0F1A2E']} style={styles.durationCard}>
            <Text style={styles.sectionLabel}>Durée de la séance</Text>
            <View style={styles.durationRow}>
              {[30, 45, 60, 75, 90].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.durationChip,
                    durationMinutes === min.toString() && styles.durationChipActive,
                  ]}
                  onPress={() => setDurationMinutes(min.toString())}
                >
                  <Text
                    style={[
                      styles.durationChipText,
                      durationMinutes === min.toString() && styles.durationChipTextActive,
                    ]}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.durationInputWrap}>
                <TextInput
                  style={styles.durationInput}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  keyboardType="number-pad"
                  placeholder="min"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </LinearGradient>

          {/* Exercises */}
          <View style={styles.exercisesSection}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.sectionLabel}>Exercices</Text>
              {totalSets > 0 && (
                <View style={styles.setsBadge}>
                  <Text style={styles.setsBadgeText}>
                    {completedSets}/{totalSets} séries
                  </Text>
                </View>
              )}
            </View>
            <ExerciseForm exercises={exercises} onChange={setExercises} />
          </View>

          {/* Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>Notes de séance</Text>
            <TextInput
              style={styles.sessionNotes}
              placeholder="Comment s'est passée la séance ? (optionnel)"
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Summary */}
          {exercises.length > 0 && (
            <LinearGradient colors={['#1A2E1A', '#0F2010']} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Résumé de la séance</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{exercises.length}</Text>
                  <Text style={styles.summaryLabel}>exercice{exercises.length > 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalSets}</Text>
                  <Text style={styles.summaryLabel}>séries totales</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{completedSets}</Text>
                  <Text style={styles.summaryLabel}>séries faites</Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={saving ? [colors.textDisabled, colors.textMuted] : [colors.primaryDark, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Ionicons name={saving ? 'hourglass' : 'checkmark-circle'} size={22} color={colors.textWhite} />
              <Text style={styles.saveBtnText}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSub,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  dateCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateArrow: {
    padding: 8,
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  timeAdjustRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  timeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  timeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  timeBtnNow: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  timeBtnNowText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  durationCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipActive: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderColor: colors.primary,
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSub,
  },
  durationChipTextActive: {
    color: colors.primary,
  },
  durationInputWrap: {
    flex: 1,
    minWidth: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  durationInput: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
  },
  exercisesSection: {
    gap: 10,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setsBadge: {
    backgroundColor: 'rgba(0,230,118,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  setsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  notesSection: {},
  sessionNotes: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textLight,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textWhite,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSub,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 30,
  },
});
