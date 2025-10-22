import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './src/components/Header';
import RoleTabs from './src/components/RoleTabs';
import TeacherScreen from './src/screens/TeacherScreen';
import ClientScreen from './src/screens/ClientScreen';
import AdminScreen from './src/screens/AdminScreen';
import { colors } from './src/theme/colors';

const screens = {
  teacher: TeacherScreen,
  client: ClientScreen,
  admin: AdminScreen
};

export default function App() {
  const [role, setRole] = useState('teacher');
  const Screen = screens[role];

  return (
    <LinearGradient colors={[colors.background, '#060613']} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <Header role={role} />
        <RoleTabs role={role} onChangeRole={setRole} />
        <View style={styles.screenWrapper}>
          <Screen />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  screenWrapper: {
    flex: 1
  }
});
