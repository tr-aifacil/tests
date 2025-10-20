import React from 'react';
import { ScrollView, View } from 'react-native';
import SectionTitle from '../components/SectionTitle';
import SummaryMetric from '../components/SummaryMetric';
import ScheduleCard from '../components/ScheduleCard';
import AttendanceBoard from '../components/AttendanceBoard';
import ActionStrip from '../components/ActionStrip';
import { teacherMetrics, teacherSessions } from '../data/mockData';
import { colors } from '../theme/colors';

export default function TeacherScreen() {
  const primarySession = teacherSessions[0];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="Dashboard do Professor" subtitle="Visão geral das aulas e presença" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {teacherMetrics.map(metric => (
          <SummaryMetric key={metric.id} {...metric} />
        ))}
      </ScrollView>

      <ActionStrip
        actions={[
          { id: 'new-class', label: 'Criar aula extra', icon: 'add-circle', tint: colors.accent },
          { id: 'call-standby', label: 'Chamar lista espera', icon: 'walk', tint: colors.highlight },
          { id: 'share', label: 'Enviar lembrete', icon: 'send', tint: colors.info }
        ]}
      />

      <SectionTitle title="Agenda" subtitle="Aulas sincronizadas com App Studio" />
      {teacherSessions.map(session => (
        <ScheduleCard
          key={session.id}
          {...session}
          actionPrimary={{ label: 'Iniciar check-in', onPress: () => {} }}
          actionSecondary={{ label: 'Reagendar turma', onPress: () => {} }}
        />
      ))}

      <SectionTitle title="Lista de presença" subtitle="Sincronizada com a app do estúdio" />
      <AttendanceBoard attendees={primarySession.attendees} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
