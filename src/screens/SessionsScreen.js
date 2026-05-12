import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import SessionCard from '../components/SessionCard';
import colors from '../theme/colors';

export default function SessionsScreen({ navigation }) {
  const { sessions, deleteSession } = useWorkout();
  const [searchText, setSearchText] = useState('');
  const [filterMachine, setFilterMachine] = useState(null);

  const allMachines = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => s.exercises.forEach((e) => set.add(e.machineName)));
    return Array.from(set).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    let result = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filterMachine) {
      result = result.filter((s) =>
        s.exercises.some((e) => e.machineName === filterMachine)
      );
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.exercises.some((e) => e.machineName.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    return result;
  }, [sessions, filterMachine, searchText]);

  const renderHeader = () => (
    <View>
      {/* Header */}
      <LinearGradient
        colors={['#0F1A2E', '#0A0A0F']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mes Séances</Text>
        <Text style={styles.headerSub}>{sessions.length} séance{sessions.length > 1 ? 's' : ''} au total</Text>
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une machine..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !filterMachine && styles.filterChipActive]}
          onPress={() => setFilterMachine(null)}
        >
          <Text style={[styles.filterChipText, !filterMachine && styles.filterChipTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
        {allMachines.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.filterChip,
              filterMachine === m && styles.filterChipActive,
              m === 'CABLEQUAD' && filterMachine === m && styles.filterChipCable,
            ]}
            onPress={() => setFilterMachine(filterMachine === m ? null : m)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterMachine === m && styles.filterChipTextActive,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyTitle}>Aucune séance trouvée</Text>
          <Text style={styles.emptyText}>
            {sessions.length === 0
              ? 'Commence ta première séance !'
              : 'Essaie un autre filtre.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <SessionCard
              session={item}
              onPress={() =>
                navigation.navigate('SessionDetail', { sessionId: item.id })
              }
              onDelete={deleteSession}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewSession')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.textWhite} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 0,
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textWhite,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderColor: colors.primary,
  },
  filterChipCable: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSub,
    letterSpacing: 0.3,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  cardWrap: {
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  fabGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
