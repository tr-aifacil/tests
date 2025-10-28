import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const defaultTabs = [
  { id: 'teacher', label: 'Professor', icon: 'people-outline', color: colors.teacher },
  { id: 'client', label: 'Cliente', icon: 'person-outline', color: colors.client },
  { id: 'admin', label: 'Admin', icon: 'settings-outline', color: colors.admin }
];

export default function RoleTabs({ role, onChangeRole, tabs = defaultTabs }) {
  return (
    <View style={styles.container}>
      {tabs.map(item => {
        const isActive = item.id === role;
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tab,
              isActive && { backgroundColor: item.color },
              Platform.OS === 'web' && styles.tabWeb
            ]}
            activeOpacity={0.85}
            onPress={() => onChangeRole(item.id)}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={isActive ? colors.textPrimary : colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 560,
    alignSelf: 'center'
  },
  tab: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6
  },
  tabWeb: {
    cursor: 'pointer'
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500'
  },
  labelActive: {
    color: colors.textPrimary
  }
});
