import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function TaskList({ tasks }) {
  return (
    <View style={styles.container}>
      {tasks.map((task, index) => (
        <View key={task.id} style={[styles.row, index < tasks.length - 1 && styles.rowDivider]}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles-outline" size={16} color={colors.accentAlt} />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{task.label}</Text>
            <Text style={styles.badge}>{task.badge}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  info: {
    flex: 1
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  badge: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13
  }
});
