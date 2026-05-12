import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@muscu_keepcool_sessions';
const INITIALIZED_KEY = '@muscu_keepcool_initialized';

const WorkoutContext = createContext(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function buildSampleData() {
  const now = new Date();
  const sessions = [];

  const machines = ['CABLEQUAD', 'PRESSE', 'TIRAGE', 'DÉVELOPPÉ COUCHÉ', 'CURL BICEPS', 'EXTENSION TRICEPS'];

  const dayOffsets = [0, 2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30, 32, 35, 37, 39, 42, 44, 46, 49, 51, 53, 56, 58, 60];
  const cableQuadWeights = [40, 42, 42, 45, 45, 47, 50, 50, 52, 55, 55, 57, 57, 60, 60, 62, 62, 65, 65, 67, 67, 70, 70, 70, 72, 72, 75];

  dayOffsets.forEach((offset, index) => {
    const sessionDate = new Date(now);
    sessionDate.setDate(now.getDate() - offset);
    sessionDate.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0, 0);

    const sessionMachines = [machines[0]]; // always include CABLEQUAD
    const extraCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < extraCount; i++) {
      const m = machines[1 + Math.floor(Math.random() * (machines.length - 1))];
      if (!sessionMachines.includes(m)) sessionMachines.push(m);
    }

    const exercises = sessionMachines.map((machine) => {
      const isCable = machine === 'CABLEQUAD';
      const baseWeight = isCable ? cableQuadWeights[index] || 75 : 20 + Math.floor(Math.random() * 60);
      const setCount = isCable ? 4 : 3;
      const sets = Array.from({ length: setCount }, (_, si) => ({
        reps: isCable ? 12 + Math.floor(Math.random() * 4) : 8 + Math.floor(Math.random() * 8),
        weight: baseWeight + si * (isCable ? 2.5 : 5),
        completed: true,
      }));
      return {
        id: generateId(),
        machineName: machine,
        sets,
        notes: '',
      };
    });

    sessions.push({
      id: generateId(),
      date: sessionDate.toISOString(),
      durationMinutes: 45 + Math.floor(Math.random() * 45),
      exercises,
      notes: index === 0 ? 'Super séance aujourd\'hui !' : '',
    });
  });

  return sessions;
}

export function WorkoutProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
      if (!initialized) {
        const sample = buildSampleData();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        await AsyncStorage.setItem(INITIALIZED_KEY, 'true');
        setSessions(sample);
      } else {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSessions(JSON.parse(raw));
        }
      }
    } catch (e) {
      console.error('Error loading sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveSessions = async (updated) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving sessions:', e);
    }
  };

  const addSession = useCallback(async (session) => {
    const newSession = { ...session, id: generateId() };
    const updated = [newSession, ...sessions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setSessions(updated);
    await saveSessions(updated);
    return newSession;
  }, [sessions]);

  const updateSession = useCallback(async (id, updates) => {
    const updated = sessions.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSessions(updated);
    await saveSessions(updated);
  }, [sessions]);

  const deleteSession = useCallback(async (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    await saveSessions(updated);
  }, [sessions]);

  const getWeekSessions = useCallback((weekOffset = 0) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday = 0
    startOfWeek.setDate(now.getDate() - day - weekOffset * 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= startOfWeek && d <= endOfWeek;
    });
  }, [sessions]);

  const getMonthSessions = useCallback((monthOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() - monthOffset;
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= startOfMonth && d <= endOfMonth;
    });
  }, [sessions]);

  const getCurrentStreak = useCallback(() => {
    if (sessions.length === 0) return 0;
    const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 1);

    // Check if there's a session today or yesterday to start streak
    const latestSession = new Date(sorted[0].date);
    latestSession.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - latestSession) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;

    // Count consecutive workout days (within the last 7 days window)
    const sessionDates = new Set(
      sorted.map((s) => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    for (let i = 0; i < 30; i++) {
      const checkTime = checkDate.getTime();
      if (sessionDates.has(checkTime)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  const getCableQuadSessions = useCallback(() => {
    return sessions
      .filter((s) => s.exercises.some((e) => e.machineName === 'CABLEQUAD'))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [sessions]);

  const getPersonalRecords = useCallback(() => {
    const records = {};
    sessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const machine = exercise.machineName;
        exercise.sets.forEach((set) => {
          if (set.completed && set.weight > 0) {
            if (!records[machine] || set.weight > records[machine].weight) {
              records[machine] = {
                weight: set.weight,
                reps: set.reps,
                date: session.date,
              };
            }
          }
        });
      });
    });
    return records;
  }, [sessions]);

  const getTotalVolume = useCallback(() => {
    return sessions.reduce((total, session) => {
      return (
        total +
        session.exercises.reduce((sTotal, exercise) => {
          return (
            sTotal +
            exercise.sets.reduce((eTotal, set) => {
              return set.completed ? eTotal + set.weight * set.reps : eTotal;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }, [sessions]);

  return (
    <WorkoutContext.Provider
      value={{
        sessions,
        loading,
        addSession,
        updateSession,
        deleteSession,
        getWeekSessions,
        getMonthSessions,
        getCurrentStreak,
        getCableQuadSessions,
        getPersonalRecords,
        getTotalVolume,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}

export default WorkoutContext;
