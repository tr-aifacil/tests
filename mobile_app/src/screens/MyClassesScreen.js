import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import SectionTitle from '../components/SectionTitle';
import ScheduleCard from '../components/ScheduleCard';
import supabase from '../lib/supabase';
import { useAuth } from '../store/auth';
import { colors } from '../theme/colors';
import { buildStudioLabel, formatSessionDate, formatSessionTime } from '../utils/format';

export default function MyClassesScreen({ isFocused }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(false);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [cancelling, setCancelling] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setUpcoming([]);
      setHistory([]);
      return;
    }

    setLoading(true);

    try {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('session_id, status, created_at')
        .eq('user_id', userId);

      if (enrollmentError) {
        throw enrollmentError;
      }

      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('session_id, created_at')
        .eq('user_id', userId);

      if (waitlistError) {
        throw waitlistError;
      }

      const sessionIds = Array.from(
        new Set([
          ...((enrollmentData || []).map(item => item.session_id)),
          ...((waitlistData || []).map(item => item.session_id))
        ])
      ).filter(Boolean);

      const { data: sessions, error: sessionsError } = sessionIds.length
        ? await supabase
            .from('sessions_with_availability')
            .select('*')
            .in('id', sessionIds)
        : { data: [], error: null };

      if (sessionsError) {
        throw sessionsError;
      }

      const byId = new Map((sessions || []).map(item => [item.id, item]));
      const now = new Date();
      const future = [];
      const past = [];

      (enrollmentData || []).forEach(enrollment => {
        const detail = byId.get(enrollment.session_id);
        if (!detail) {
          return;
        }
        const startDate = new Date(detail.start_at);
        const base = {
          id: `${enrollment.session_id}-${enrollment.status}-${enrollment.created_at}`,
          sessionId: enrollment.session_id,
          title: detail.class_name || 'Aula de Pilates',
          studio: buildStudioLabel(detail),
          level: detail.class_level,
          date: formatSessionDate(detail.start_at),
          time: formatSessionTime(detail.start_at, detail.end_at),
          occupancy: detail.booked_count || 0,
          capacity: detail.capacity,
          waitlist: detail.waitlist_count || 0,
          status: enrollment.status
        };

        if (enrollment.status === 'booked' && startDate >= now) {
          future.push(base);
        } else {
          past.push(base);
        }
      });

      (waitlistData || []).forEach(entry => {
        const detail = byId.get(entry.session_id);
        if (!detail) {
          return;
        }
        const startDate = new Date(detail.start_at);
        if (startDate >= now) {
          future.push({
            id: `${entry.session_id}-waitlist-${entry.created_at}`,
            sessionId: entry.session_id,
            title: detail.class_name || 'Aula de Pilates',
            studio: buildStudioLabel(detail),
            level: detail.class_level,
            date: formatSessionDate(detail.start_at),
            time: formatSessionTime(detail.start_at, detail.end_at),
            occupancy: detail.booked_count || 0,
            capacity: detail.capacity,
            waitlist: detail.waitlist_count || 0,
            status: 'waitlist'
          });
        }
      });

      future.sort((a, b) => {
        const aDetail = byId.get(a.sessionId);
        const bDetail = byId.get(b.sessionId);
        return new Date(aDetail.start_at) - new Date(bDetail.start_at);
      });

      past.sort((a, b) => {
        const aDetail = byId.get(a.sessionId);
        const bDetail = byId.get(b.sessionId);
        return new Date(bDetail?.start_at || 0) - new Date(aDetail?.start_at || 0);
      });

      setUpcoming(future);
      setHistory(past);
    } catch (error) {
      console.warn('Erro ao carregar reservas', error);
      Alert.alert('Erro', 'Não foi possível carregar as tuas reservas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [fetchData, isFocused]);

  const handleCancel = useCallback(async (sessionId) => {
    if (!sessionId) {
      return;
    }

    setCancelling(sessionId);

    try {
      const { data, error } = await supabase.rpc('cancel_booking', { p_session: sessionId });

      if (error) {
        throw error;
      }

      const result = data || 'canceled';
      const messages = {
        canceled: 'Reserva cancelada e crédito devolvido.',
        cutoff_passed: 'A aula começa em menos de 12h — contacta o estúdio.',
        not_booked: 'Não tinhas reserva activa para esta aula.',
        promoted: 'Cancelada — alguém da lista foi promovido.'
      };

      Alert.alert('Gestão da reserva', messages[result] || 'Operação concluída.');
      await fetchData();
    } catch (error) {
      console.warn('Erro ao cancelar reserva', error);
      Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
    } finally {
      setCancelling(null);
    }
  }, [fetchData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="Reservas futuras" subtitle="Confirma, cancela ou gere listas de espera" />
      {loading && !upcoming.length ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      {upcoming.map(item => (
        <ScheduleCard
          key={item.id}
          {...item}
          color={colors.client}
          actionSecondary={
            item.status === 'booked' || item.status === 'waitlist'
              ? {
                  label: cancelling === item.sessionId ? 'A processar...' : item.status === 'waitlist' ? 'Sair da lista' : 'Cancelar reserva',
                  onPress: () => handleCancel(item.sessionId)
                }
              : null
          }
        />
      ))}
      {!upcoming.length && !loading ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>Sem reservas futuras.</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>
              Reserva novas aulas através do painel do cliente.
            </Text>
          </View>
        </View>
      ) : null}

      <SectionTitle title="Histórico" subtitle="Canceladas, presenças e faltas" />
      {loading && !history.length ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      {history.map(item => (
        <ScheduleCard
          key={item.id}
          {...item}
          color={colors.surfaceAlt}
        />
      ))}
      {!history.length && !loading ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>Ainda sem histórico.</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>
              As aulas concluídas e cancelamentos aparecerão aqui.
            </Text>
          </View>
        </View>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
