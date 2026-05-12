import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const label = date.toLocaleDateString('fr-FR', options);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getDaysAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  return `Il y a ${diffDays} jours`;
}

export default function SessionCard({ session, onPress, onDelete }) {
  const machineNames = session.exercises.map((e) => e.machineName);
  const uniqueMachines = [...new Set(machineNames)];
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0);
  const completedSets = session.exercises.reduce(
    (n, e) => n + e.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = session.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.reduce(
        (st, set) => (set.completed ? st + set.weight * set.reps : st),
        0
      ),
    0
  );
  const hasCableQuad = machineNames.includes('CABLEQUAD');

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la séance',
      'Voulez-vous vraiment supprimer cette séance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(session.id) },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={hasCableQuad ? ['#1A1A2E', '#0F2040'] : ['#1A1A2E', '#1A1A2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {hasCableQuad && (
          <View style={styles.cableQuadBadge}>
            <Text style={styles.cableQuadBadgeText}>⚡ CABLEQUAD</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateText}>{formatDate(session.date)}</Text>
            <Text style={styles.timeText}>{formatTime(session.date)} · {getDaysAgo(session.date)}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱</Text>
            <Text style={styles.statValue}>{session.durationMinutes} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏋️</Text>
            <Text style={styles.statValue}>{session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{completedSets}/{totalSets} séries</Text>
          </View>
        </View>

        <View style={styles.volumeRow}>
          <Text style={styles.volumeLabel}>Volume total</Text>
          <Text style={styles.volumeValue}>
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)} t`
              : `${totalVolume} kg`}
          </Text>
        </View>

        <View style={styles.machinesRow}>
          {uniqueMachines.slice(0, 4).map((m) => (
            <View
              key={m}
              style={[
                styles.machineTag,
                m === 'CABLEQUAD' && styles.machineTagHighlight,
              ]}
            >
              <Text
                style={[
                  styles.machineTagText,
                  m === 'CABLEQUAD' && styles.machineTagTextHighlight,
                ]}
              >
                {m}
              </Text>
            </View>
          ))}
          {uniqueMachines.length > 4 && (
            <View style={styles.machineTag}>
              <Text style={styles.machineTagText}>+{uniqueMachines.length - 4}</Text>
            </View>
          )}
        </View>

        {session.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            💬 {session.notes}
          </Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cableQuadBadge: {
    position: 'absolute',
    top: 12,
    right: 44,
    backgroundColor: '#0F3460',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cableQuadBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateBlock: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  volumeLabel: {
    fontSize: 12,
    color: colors.textSub,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  machinesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  machineTag: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  machineTagHighlight: {
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderColor: colors.primary,
  },
  machineTagText: {
    fontSize: 11,
    color: colors.textSub,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  machineTagTextHighlight: {
    color: colors.primary,
  },
  notes: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
