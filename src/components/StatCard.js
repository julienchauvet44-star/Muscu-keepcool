import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  onPress,
  style,
  large,
}) {
  const gradientColors = gradient || colors.gradientBlue;

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, large && styles.cardLarge, style]}
    >
      <View style={styles.iconRow}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, large && styles.valueLarge]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLarge: {
    padding: 20,
    minWidth: '100%',
  },
  iconRow: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  valueLarge: {
    fontSize: 42,
  },
  title: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
