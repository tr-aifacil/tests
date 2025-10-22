import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const statusCopy = {
  confirmed: { label: 'Confirmada', icon: 'checkmark-circle', color: colors.highlight },
  booked: { label: 'Reservada', icon: 'checkmark-circle', color: colors.highlight },
  credit: { label: 'Crédito devolvido', icon: 'refresh-circle', color: colors.accent },
  waitlist: { label: 'Lista de espera', icon: 'hourglass', color: colors.warn },
  canceled: { label: 'Cancelada', icon: 'close-circle', color: colors.warn },
  no_show: { label: 'Falta', icon: 'remove-circle', color: colors.warn }
};

export default function ScheduleCard({
  title,
  level,
  studio,
  date,
  time,
  occupancy,
  capacity,
  waitlist,
  status,
  color = colors.accent,
  actionPrimary,
  actionSecondary
}) {
  const statusMeta = status ? statusCopy[status] : null;

  return (
    <LinearGradient colors={[color, colors.cardGradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {statusMeta ? (
          <View style={styles.status}>
            <Ionicons name={statusMeta.icon} color={statusMeta.color} size={16} />
            <Text style={[styles.statusLabel, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        ) : null}
      </View>
      {level ? <Text style={styles.level}>{level} • {studio}</Text> : <Text style={styles.level}>{studio}</Text>}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" color={colors.highlightSoft} size={16} />
          <Text style={styles.metaText}>{date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" color={colors.highlightSoft} size={16} />
          <Text style={styles.metaText}>{time}</Text>
        </View>
      </View>
      {typeof occupancy !== 'undefined' ? (
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="people" color={colors.highlightSoft} size={16} />
            <Text style={styles.metaText}>{occupancy}/{capacity} presentes</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="trending-up" color={colors.highlightSoft} size={16} />
            <Text style={styles.metaText}>{waitlist} espera</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.actions}>
        {actionPrimary ? (
          <TouchableOpacity style={styles.primary} onPress={actionPrimary.onPress} activeOpacity={0.85}>
            <Text style={styles.primaryLabel}>{actionPrimary.label}</Text>
          </TouchableOpacity>
        ) : null}
        {actionSecondary ? (
          <TouchableOpacity style={styles.secondary} onPress={actionSecondary.onPress} activeOpacity={0.85}>
            <Text style={styles.secondaryLabel}>{actionSecondary.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600'
  },
  status: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  level: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 13
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaText: {
    color: colors.textPrimary,
    fontSize: 13
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12
  },
  primary: {
    flex: 1,
    backgroundColor: colors.overlay,
    borderRadius: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  primaryLabel: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  secondary: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryLabel: {
    color: colors.textSecondary,
    fontWeight: '600'
  }
});
