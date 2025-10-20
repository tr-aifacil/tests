import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function HighlightCard({ value, label, accent }) {
  return (
    <View style={[styles.container, { borderColor: accent || colors.accent }] }>
      <View style={[styles.badge, { backgroundColor: (accent || colors.accent) + '1A' }]} />
      <Text style={[styles.value, { color: accent || colors.accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginRight: 12,
    backgroundColor: colors.surfaceAlt
  },
  badge: {
    width: 24,
    height: 4,
    borderRadius: 4,
    marginBottom: 12
  },
  value: {
    fontSize: 24,
    fontWeight: '700'
  },
  label: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 13
  }
});
