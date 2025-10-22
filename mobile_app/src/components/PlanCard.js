import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function PlanCard({ title, price, benefits, members }) {
  return (
    <LinearGradient
      colors={[colors.surfaceAlt, colors.cardGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
      {benefits.map(benefit => (
        <View key={benefit} style={styles.benefitRow}>
          <Ionicons name="checkmark" size={16} color={colors.highlight} />
          <Text style={styles.benefit}>{benefit}</Text>
        </View>
      ))}
      <View style={styles.footer}>
        <View style={styles.memberBadge}>
          <Ionicons name="people" size={15} color={colors.textPrimary} />
          <Text style={styles.memberLabel}>{members} inscritos</Text>
        </View>
        <Text style={styles.cta}>Gerir plano</Text>
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
    borderColor: colors.border
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  price: {
    color: colors.highlight,
    fontSize: 20,
    fontWeight: '700'
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  benefit: {
    color: colors.textSecondary,
    fontSize: 14
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  memberLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  cta: {
    color: colors.accentAlt,
    fontSize: 14,
    fontWeight: '600'
  }
});
