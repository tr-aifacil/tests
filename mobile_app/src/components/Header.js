import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Header({ title, subtitle }) {
  const headerTitle = title || 'Pilates Studio';
  const headerSubtitle = subtitle || 'Agenda sincronizada com o estúdio.';

  return (
    <LinearGradient
      colors={[colors.cardGradientStart, colors.cardGradientEnd]}
      style={styles.container}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="leaf" size={22} color={colors.highlightSoft} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>
      </View>
      <View style={styles.badge}>
        <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  textWrapper: {
    flex: 1
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 0.3
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  }
});
