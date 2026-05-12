import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const MACHINES = [
  { name: 'CABLEQUAD', icon: '⚡', color: colors.primary },
  { name: 'PRESSE', icon: '🦵', color: colors.secondary },
  { name: 'TIRAGE', icon: '💪', color: colors.success },
  { name: 'DÉVELOPPÉ COUCHÉ', icon: '🏋️', color: colors.purple },
  { name: 'CURL BICEPS', icon: '💪', color: colors.teal },
  { name: 'EXTENSION TRICEPS', icon: '🔱', color: colors.warning },
  { name: 'ÉPAULES', icon: '🔝', color: colors.secondary },
  { name: 'ABDOS', icon: '🔢', color: colors.success },
  { name: 'CARDIO', icon: '🏃', color: colors.error },
  { name: 'AUTRE', icon: '🏅', color: colors.textSub },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function createEmptySet() {
  return { id: generateId(), reps: 12, weight: 30, completed: true };
}

export default function ExerciseForm({ exercises, onChange }) {
  const [showMachinePicker, setShowMachinePicker] = useState(false);

  const addExercise = (machine) => {
    const newExercise = {
      id: generateId(),
      machineName: machine.name,
      sets: [createEmptySet(), createEmptySet(), createEmptySet()],
      notes: '',
    };
    onChange([...exercises, newExercise]);
    setShowMachinePicker(false);
  };

  const removeExercise = (id) => {
    onChange(exercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id, updates) => {
    onChange(exercises.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const addSet = (exerciseId) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      id: generateId(),
      reps: lastSet ? lastSet.reps : 12,
      weight: lastSet ? lastSet.weight : 30,
      completed: true,
    };
    updateExercise(exerciseId, { sets: [...exercise.sets, newSet] });
  };

  const removeSet = (exerciseId, setId) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise || exercise.sets.length <= 1) return;
    updateExercise(exerciseId, {
      sets: exercise.sets.filter((s) => s.id !== setId),
    });
  };

  const updateSet = (exerciseId, setId, field, value) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    const numVal = parseFloat(value) || 0;
    updateExercise(exerciseId, {
      sets: exercise.sets.map((s) =>
        s.id === setId ? { ...s, [field]: numVal } : s
      ),
    });
  };

  const toggleSet = (exerciseId, setId) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    updateExercise(exerciseId, {
      sets: exercise.sets.map((s) =>
        s.id === setId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  return (
    <View style={styles.container}>
      {exercises.map((exercise, exIdx) => (
        <ExerciseBlock
          key={exercise.id}
          exercise={exercise}
          index={exIdx}
          onRemove={() => removeExercise(exercise.id)}
          onAddSet={() => addSet(exercise.id)}
          onRemoveSet={(setId) => removeSet(exercise.id, setId)}
          onUpdateSet={(setId, field, value) =>
            updateSet(exercise.id, setId, field, value)
          }
          onToggleSet={(setId) => toggleSet(exercise.id, setId)}
          onNotesChange={(text) =>
            updateExercise(exercise.id, { notes: text })
          }
        />
      ))}

      {/* Add Machine Button */}
      <TouchableOpacity
        style={styles.addMachineBtn}
        onPress={() => setShowMachinePicker(!showMachinePicker)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={showMachinePicker ? 'close-circle-outline' : 'add-circle-outline'}
          size={20}
          color={colors.primary}
        />
        <Text style={styles.addMachineBtnText}>
          {showMachinePicker ? 'Fermer' : 'Ajouter un exercice'}
        </Text>
      </TouchableOpacity>

      {/* Machine Picker */}
      {showMachinePicker && (
        <LinearGradient
          colors={['#1A1A2E', '#0F1A2E']}
          style={styles.machinePicker}
        >
          <Text style={styles.machinePickerTitle}>Choisir une machine</Text>
          <View style={styles.machineGrid}>
            {MACHINES.map((m) => (
              <TouchableOpacity
                key={m.name}
                style={[
                  styles.machineItem,
                  { borderColor: m.color + '40' },
                ]}
                onPress={() => addExercise(m)}
                activeOpacity={0.8}
              >
                <Text style={styles.machineItemIcon}>{m.icon}</Text>
                <Text style={[styles.machineItemText, { color: m.color }]} numberOfLines={2}>
                  {m.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      )}
    </View>
  );
}

function ExerciseBlock({
  exercise,
  index,
  onRemove,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
  onNotesChange,
}) {
  const machine = MACHINES.find((m) => m.name === exercise.machineName) || {
    icon: '🏅',
    color: colors.textSub,
  };
  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <View style={[styles.exerciseBlock, { borderLeftColor: machine.color }]}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseTitleRow}>
          <Text style={styles.exerciseIcon}>{machine.icon}</Text>
          <Text style={[styles.exerciseName, { color: machine.color }]}>
            {exercise.machineName}
          </Text>
          <Text style={styles.exerciseSetsCount}>
            {completedSets}/{exercise.sets.length} séries
          </Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeExBtn}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Sets header */}
      <View style={styles.setsHeader}>
        <Text style={styles.setsHeaderItem}>Série</Text>
        <Text style={styles.setsHeaderItem}>Poids (kg)</Text>
        <Text style={styles.setsHeaderItem}>Reps</Text>
        <Text style={styles.setsHeaderItem}>✓</Text>
      </View>

      {exercise.sets.map((set, setIdx) => (
        <View
          key={set.id}
          style={[styles.setRow, !set.completed && styles.setRowIncomplete]}
        >
          <Text style={styles.setNumber}>{setIdx + 1}</Text>
          <TextInput
            style={styles.setInput}
            value={set.weight.toString()}
            onChangeText={(v) => onUpdateSet(set.id, 'weight', v)}
            keyboardType="decimal-pad"
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.setInput}
            value={set.reps.toString()}
            onChangeText={(v) => onUpdateSet(set.id, 'reps', v)}
            keyboardType="number-pad"
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity onPress={() => onToggleSet(set.id)} style={styles.checkBtn}>
            <View
              style={[
                styles.checkBox,
                set.completed && { backgroundColor: machine.color, borderColor: machine.color },
              ]}
            >
              {set.completed && (
                <Ionicons name="checkmark" size={12} color={colors.textWhite} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemoveSet(set.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.removeSetBtn}
          >
            <Ionicons name="remove-circle-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={14} color={machine.color} />
        <Text style={[styles.addSetBtnText, { color: machine.color }]}>
          Ajouter une série
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.notesInput}
        placeholder="Notes (optionnel)..."
        placeholderTextColor={colors.textMuted}
        value={exercise.notes}
        onChangeText={onNotesChange}
        multiline
        numberOfLines={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  exerciseBlock: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  exerciseIcon: {
    fontSize: 20,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  exerciseSetsCount: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  removeExBtn: {
    padding: 4,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  setsHeaderItem: {
    flex: 1,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  setRowIncomplete: {
    opacity: 0.5,
  },
  setNumber: {
    width: 24,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSub,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
    textAlign: 'center',
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    marginHorizontal: 4,
    paddingHorizontal: 4,
  },
  checkBtn: {
    flex: 1,
    alignItems: 'center',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSetBtn: {
    width: 24,
    alignItems: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
    paddingVertical: 6,
  },
  addSetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.textLight,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  addMachineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 4,
  },
  addMachineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  machinePicker: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  machinePickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSub,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  machineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  machineItem: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  machineItemIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  machineItemText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
