import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const statusTokens = {
  present: { label: 'Presente', icon: 'checkmark-circle', tint: colors.highlight },
  absent: { label: 'Falta', icon: 'close-circle', tint: colors.warn },
  waitlist: { label: 'Espera', icon: 'hourglass', tint: colors.accent },
  late: { label: 'Atraso', icon: 'time', tint: colors.info }
};

export default function AttendanceBoard({ attendees }) {
  return (
    <View style={styles.container}>
      {attendees.map((student, index) => {
        const meta = statusTokens[student.status] || statusTokens.present;
        return (
          <View key={student.id} style={[styles.row, index < attendees.length - 1 && styles.rowDivider]}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{student.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{student.name}</Text>
              <View style={styles.tag}>
                <Ionicons name={meta.icon} size={14} color={meta.tint} />
                <Text style={[styles.tagLabel, { color: meta.tint }]}>{meta.label}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    marginHorizontal: 20,
    paddingVertical: 4,
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  initials: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  info: {
    flex: 1
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  tag: {
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start'
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '600'
  }
});
