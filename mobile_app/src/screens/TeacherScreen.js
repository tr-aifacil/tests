import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

import SectionTitle from '../components/SectionTitle';
import SummaryMetric from '../components/SummaryMetric';
import ScheduleCard from '../components/ScheduleCard';
import AttendanceBoard from '../components/AttendanceBoard';
import ActionStrip from '../components/ActionStrip';
import supabase from '../lib/supabase';
import { useAuth } from '../store/auth';
import { colors } from '../theme/colors';
import { buildStudioLabel, formatSessionDate, formatSessionTime } from '../utils/format';

export default function TeacherScreen({ isFocused }) {
  const { session } = useAuth();
  const instructorId = session?.user?.id;
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const fetchAttendance = useCallback(async (sessionId) => {
    if (!sessionId || !instructorId) {
      setAttendees([]);
      return;
    }

    const { data, error } = await supabase
      .from('enrollments')
      .select('id,status,profiles(full_name)')
      .eq('session_id', sessionId);

    if (error) {
      console.warn('Falha ao carregar presenças', error);
      setAttendees([]);
      return;
    }

    const mapped = (data || []).map(item => ({
      id: item.id,
      name: item.profiles?.full_name || 'Aluno',
      status: item.status === 'booked' ? 'present' : item.status === 'no_show' ? 'late' : 'absent'
    }));

    setAttendees(mapped);
  }, [instructorId]);

  const fetchSessions = useCallback(async () => {
    if (!instructorId) {
      setSessions([]);
      setAttendees([]);
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const startWindow = new Date(now);
      startWindow.setDate(startWindow.getDate() - 7);
      const endWindow = new Date(now);
      endWindow.setDate(endWindow.getDate() + 7);

      const { data, error } = await supabase
        .from('sessions_with_availability')
        .select('*')
        .eq('instructor_id', instructorId)
        .gte('start_at', startWindow.toISOString())
        .lte('start_at', endWindow.toISOString())
        .order('start_at', { ascending: true });

      if (error) {
        throw error;
      }

      setSessions(data || []);

      if (data && data.length) {
        const firstSession = data[0].id;
        setActiveSessionId(firstSession);
        await fetchAttendance(firstSession);
      } else {
        setActiveSessionId(null);
        setAttendees([]);
      }
    } catch (error) {
      console.warn('Erro ao carregar sessões do professor', error);
      Alert.alert('Erro ao sincronizar', 'Não foi possível carregar as aulas do professor.');
    } finally {
      setLoading(false);
    }
  }, [fetchAttendance, instructorId]);

  useEffect(() => {
    if (isFocused) {
      fetchSessions();
    }
  }, [fetchSessions, isFocused]);

  const metrics = useMemo(() => {
    if (!sessions.length) {
      return [
        { id: 'agenda', value: '0', label: 'Aulas no período', caption: 'Inclui últimos e próximos 7 dias', color: colors.teacher },
        { id: 'lotacao', value: '0', label: 'Alunos confirmados', caption: 'Reservas activas', color: colors.highlight },
        { id: 'espera', value: '0', label: 'Em lista de espera', caption: 'Alunos à espera de vaga', color: colors.warn }
      ];
    }

    const now = new Date();
    const rangeSessions = sessions.filter(s => Math.abs(new Date(s.start_at) - now) <= 7 * 24 * 3600 * 1000);
    const totalEnrolled = rangeSessions.reduce((acc, s) => acc + (s.booked_count || 0), 0);
    const totalWaitlist = rangeSessions.reduce((acc, s) => acc + (s.waitlist_count || 0), 0);

    return [
      {
        id: 'agenda',
        value: String(rangeSessions.length),
        label: 'Aulas no período',
        caption: 'Últimos e próximos 7 dias',
        color: colors.teacher
      },
      {
        id: 'lotacao',
        value: String(totalEnrolled),
        label: 'Alunos confirmados',
        caption: 'Reservas activas',
        color: colors.highlight
      },
      {
        id: 'espera',
        value: String(totalWaitlist),
        label: 'Lista de espera',
        caption: 'Aguardam vaga',
        color: colors.warn
      }
    ];
  }, [sessions]);

  const handleSelectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    fetchAttendance(sessionId);
  }, [fetchAttendance]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="Dashboard do Professor" subtitle="Visão geral das aulas e presença" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {metrics.map(metric => (
          <SummaryMetric key={metric.id} {...metric} />
        ))}
      </ScrollView>

      <ActionStrip
        actions={[
          {
            id: 'refresh',
            label: 'Sincronizar agenda',
            icon: 'refresh',
            tint: colors.highlight,
            onPress: fetchSessions
          },
          {
            id: 'attendance',
            label: 'Actualizar presenças',
            icon: 'people',
            tint: colors.teacher,
            onPress: () => activeSessionId && fetchAttendance(activeSessionId)
          },
          {
            id: 'extra',
            label: 'Criar aula extra',
            icon: 'add-circle',
            tint: colors.accent,
            onPress: () => Alert.alert('Em breve', 'A gestão de aulas extra ficará disponível numa próxima iteração.')
          }
        ]}
      />

      <SectionTitle title="Agenda" subtitle="Aulas sincronizadas com Supabase" />
      {loading && !sessions.length ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      {sessions.map(sessionItem => {
        const isActive = sessionItem.id === activeSessionId;
        return (
          <ScheduleCard
            key={sessionItem.id}
            id={sessionItem.id}
            title={sessionItem.class_name || 'Aula de Pilates'}
            level={sessionItem.class_level}
            studio={buildStudioLabel(sessionItem)}
            date={formatSessionDate(sessionItem.start_at)}
            time={formatSessionTime(sessionItem.start_at, sessionItem.end_at)}
            occupancy={sessionItem.booked_count || 0}
            capacity={sessionItem.capacity}
            waitlist={sessionItem.waitlist_count || 0}
            status={sessionItem.status === 'canceled' ? 'canceled' : 'booked'}
            color={isActive ? colors.teacher : colors.cardGradientStart}
            actionPrimary={{ label: 'Ver presenças', onPress: () => handleSelectSession(sessionItem.id) }}
            actionSecondary={{ label: 'Ver detalhes', onPress: () => {} }}
          />
        );
      })}

      <SectionTitle title="Lista de presença" subtitle="Sincronizada com a app do estúdio" />
      {loading && sessions.length ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      <AttendanceBoard attendees={attendees} />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
