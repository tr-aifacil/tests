import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './src/components/Header';
import RoleTabs from './src/components/RoleTabs';
import TeacherScreen from './src/screens/TeacherScreen';
import ClientScreen from './src/screens/ClientScreen';
import AdminScreen from './src/screens/AdminScreen';
import LoginScreen from './src/screens/LoginScreen';
import MyClassesScreen from './src/screens/MyClassesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/store/auth';

const screens = {
  teacher: TeacherScreen,
  client: ClientScreen,
  admin: AdminScreen,
  myClasses: MyClassesScreen,
  profile: ProfileScreen
};

const TAB_DEFINITIONS = {
  teacher: { id: 'teacher', label: 'Professor', icon: 'people-outline', color: colors.teacher },
  client: { id: 'client', label: 'Cliente', icon: 'person-outline', color: colors.client },
  myClasses: { id: 'myClasses', label: 'Minhas aulas', icon: 'calendar-outline', color: colors.accent },
  profile: { id: 'profile', label: 'Perfil', icon: 'person-circle-outline', color: colors.info },
  admin: { id: 'admin', label: 'Admin', icon: 'settings-outline', color: colors.admin }
};

function getTabsForRole(role) {
  const tabs = [];

  if (role === 'instructor' || role === 'admin') {
    tabs.push(TAB_DEFINITIONS.teacher);
  }

  if (role === 'client' || role === 'admin') {
    tabs.push(TAB_DEFINITIONS.client);
  }

  tabs.push(TAB_DEFINITIONS.myClasses, TAB_DEFINITIONS.profile);

  if (role === 'admin') {
    tabs.push(TAB_DEFINITIONS.admin);
  }

  if (!tabs.length) {
    return [TAB_DEFINITIONS.client, TAB_DEFINITIONS.myClasses, TAB_DEFINITIONS.profile];
  }

  return tabs;
}

function getHeaderCopy(activeTab, profile) {
  const name = profile?.full_name?.split(' ')[0] || 'Pilates';

  switch (activeTab) {
    case 'teacher':
      return {
        title: `Agenda de ${name}`,
        subtitle: 'Acompanha as turmas desta semana.'
      };
    case 'myClasses':
      return {
        title: 'As minhas aulas',
        subtitle: 'Reservas e histórico actualizados em tempo real.'
      };
    case 'profile':
      return {
        title: profile?.full_name || 'Perfil do estúdio',
        subtitle: 'Gerir créditos, contacto e notificações push.'
      };
    case 'admin':
      return {
        title: 'Gestão Studio',
        subtitle: 'Painel financeiro e operacional do estúdio.'
      };
    case 'client':
    default:
      return {
        title: `Olá, ${name}`,
        subtitle: 'Mantém a rotina alinhada com a App Studio.'
      };
  }
}

function AppContent() {
  const { loading, session, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('client');
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileReady(true);
    } else if (!session) {
      setProfileReady(false);
    }
  }, [profile, session]);

  const availableTabs = useMemo(() => getTabsForRole(profile?.role), [profile?.role]);

  useEffect(() => {
    if (!availableTabs.length) {
      return;
    }

    const defaultTab = availableTabs[0].id;
    setActiveTab(current => {
      const stillExists = availableTabs.some(tab => tab.id === current);
      return stillExists ? current : defaultTab;
    });
  }, [availableTabs]);

  const headerCopy = useMemo(() => getHeaderCopy(activeTab, profile), [activeTab, profile]);

  if (loading || (session && !profileReady)) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.highlight} size="small" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  const ScreenComponent = screens[activeTab] || ClientScreen;

  return (
    <>
      <Header title={headerCopy.title} subtitle={headerCopy.subtitle} />
      <RoleTabs role={activeTab} onChangeRole={setActiveTab} tabs={availableTabs} />
      <View style={styles.screenWrapper}>
        <ScreenComponent
          isFocused
          profile={profile}
          onNavigate={setActiveTab}
        />
      </View>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LinearGradient colors={[colors.background, '#060613']} style={styles.gradient}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <AppContent />
        </SafeAreaView>
      </LinearGradient>
    </AuthProvider>
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
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
