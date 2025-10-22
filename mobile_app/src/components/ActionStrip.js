import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ActionStrip({ actions }) {
  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={styles.action}
          activeOpacity={0.9}
          onPress={action.onPress}
        >
          <View style={[styles.iconWrapper, { backgroundColor: action.tint + '26' }] }>
            <Ionicons name={action.icon} size={18} color={action.tint} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    gap: 12
  },
  action: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 12
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  }
});
