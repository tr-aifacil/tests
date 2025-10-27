import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import SectionTitle from '../components/SectionTitle';
import HighlightCard from '../components/HighlightCard';
import ScheduleCard from '../components/ScheduleCard';
import ActionStrip from '../components/ActionStrip';
import supabase from '../lib/supabase';
import { useAuth } from '../store/auth';
import { colors } from '../theme/colors';
import { buildStudioLabel, formatSessionDate, formatSessionTime } from '../utils/format';

export default function ClientScreen({ isFocused, onNavigate }) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [bookingSession, setBookingSession] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setHighlights([]);
      setBookings([]);
      setAvailableSessions([]);
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const nowIso = now.toISOString();

      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('session_id, status')
        .eq('user_id', userId);

      if (enrollmentError) {
        throw enrollmentError;
      }

      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('session_id')
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

      const { data: sessionDetails, error: sessionError } = sessionIds.length
        ? await supabase
            .from('sessions_with_availability')
            .select('*')
            .in('id', sessionIds)
        : { data: [], error: null };

      if (sessionError) {
        throw sessionError;
      }

      const upcomingBookings = (sessionDetails || [])
        .filter(item => new Date(item.start_at) >= now)
        .filter(item => (enrollmentData || []).some(en => en.session_id === item.id && en.status === 'booked'))
        .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
        .map(item => ({
          id: item.id,
          title: item.class_name || 'Aula de Pilates',
          studio: buildStudioLabel(item),
          level: item.class_level,
          date: formatSessionDate(item.start_at),
          time: formatSessionTime(item.start_at, item.end_at),
          status: 'booked'
        }));

      const { data: walletData, error: walletError } = await supabase
        .from('credit_wallet')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      const balance = walletData?.balance ?? 0;

      const excludedSessions = new Set(sessionIds);

      const { data: availableData, error: availableError } = await supabase
        .from('sessions_with_availability')
        .select('*')
        .gte('start_at', nowIso)
        .eq('status', 'scheduled')
        .order('start_at', { ascending: true })
        .limit(8);

      if (availableError) {
        throw availableError;
      }

      const mappedAvailable = (availableData || [])
        .filter(item => !excludedSessions.has(item.id))
        .map(item => ({
          id: item.id,
          title: item.class_name || 'Aula de Pilates',
          studio: buildStudioLabel(item),
          level: item.class_level,
          date: formatSessionDate(item.start_at),
          time: formatSessionTime(item.start_at, item.end_at),
          occupancy: item.booked_count || 0,
          capacity: item.capacity,
          waitlist: item.waitlist_count || 0,
          status: item.available_spots > 0 ? 'confirmed' : 'waitlist'
        }));

      setBookings(upcomingBookings);
      setAvailableSessions(mappedAvailable);
      setHighlights([
        {
          id: 'credits',
          value: String(balance),
          label: 'Créditos disponíveis',
          accent: colors.client
        },
        {
          id: 'upcoming',
          value: String(upcomingBookings.length),
          label: 'Próximas aulas',
          accent: colors.highlight
        }
      ]);
    } catch (error) {
      console.warn('Erro ao carregar dados do cliente', error);
      Alert.alert('Erro', 'Não foi possível sincronizar as tuas aulas.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [fetchData, isFocused]);

  const handleBook = useCallback(async (sessionId) => {
    if (!sessionId || bookingSession) {
      return;
    }

    setBookingSession(sessionId);

    try {
      const { data, error } = await supabase.rpc('book_session', { p_session: sessionId });

      if (error) {
        throw error;
      }

      const result = data || 'booked';
      const messages = {
        booked: 'Reserva confirmada com sucesso.',
        waitlisted: 'Sem vagas no momento, ficaste em lista de espera.',
        insufficient_credits: 'Saldo de créditos insuficiente para reservar.',
        already_booked: 'Já tens esta aula reservada.',
        already_waitlisted: 'Já estás na lista de espera desta aula.',
        session_closed: 'A sessão não está disponível para reservas.'
      };

      Alert.alert('Estado da reserva', messages[result] || 'Operação concluída.');
      await fetchData();
    } catch (error) {
      console.warn('Erro ao reservar sessão', error);
      Alert.alert('Erro', 'Não foi possível concluir a reserva.');
    } finally {
      setBookingSession(null);
    }
  }, [bookingSession, fetchData]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="A tua semana" subtitle="Mantém a rotina em dia" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {highlights.map(item => (
          <HighlightCard key={item.id} {...item} />
        ))}
      </ScrollView>

      <ActionStrip
        actions={[
          {
            id: 'check-in',
            label: 'Confirmar presença',
            icon: 'checkmark-done',
            tint: colors.client,
            onPress: () => onNavigate?.('myClasses')
          },
          {
            id: 'cancel',
            label: 'Avisar falta',
            icon: 'alert-circle',
            tint: colors.warn,
            onPress: () => onNavigate?.('myClasses')
          },
          {
            id: 'reschedule',
            label: 'Reagendar aula',
            icon: 'swap-horizontal',
            tint: colors.accent,
            onPress: () => onNavigate?.('myClasses')
          }
        ]}
      />

      <SectionTitle title="Próximas aulas" subtitle="Reservas em tempo real" />
      {loading && !bookings.length ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      {bookings.map(booking => (
        <ScheduleCard
          key={booking.id}
          {...booking}
          studio={`${booking.studio}`}
          color={colors.client}
        />
      ))}
      {!bookings.length && !loading ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>Sem reservas confirmadas.</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>
              Escolhe uma aula disponível para reservar.
            </Text>
          </View>
        </View>
      ) : null}

      <SectionTitle title="Disponíveis para reserva" subtitle="Agenda da próxima semana" />
      {loading && !availableSessions.length ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}
      {availableSessions.map(sessionItem => (
        <ScheduleCard
          key={sessionItem.id}
          {...sessionItem}
          color={colors.accent}
          actionPrimary={{
            label: bookingSession === sessionItem.id ? 'A reservar...' : 'Reservar',
            onPress: () => handleBook(sessionItem.id)
          }}
        />
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
