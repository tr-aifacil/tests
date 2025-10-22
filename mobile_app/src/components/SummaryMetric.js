import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../theme/colors';

export default function SummaryMetric({ value, label, caption, color }) {
  return (
    <View style={[styles.container, { borderColor: color, backgroundColor: 'rgba(255,255,255,0.04)' }] }>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 148,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 12
  },
  indicator: {
    width: 18,
    height: 3,
    borderRadius: 3,
    marginBottom: 10
  },
  value: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700'
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8
  }
});
