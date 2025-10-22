import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import SectionTitle from '../components/SectionTitle';
import HighlightCard from '../components/HighlightCard';
import ScheduleCard from '../components/ScheduleCard';
import ActionStrip from '../components/ActionStrip';
import { clientHighlights, clientBookings } from '../data/mockData';
import { colors } from '../theme/colors';

export default function ClientScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="A tua semana" subtitle="Mantém a rotina em dia" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        {clientHighlights.map(item => (
          <HighlightCard key={item.id} {...item} />
        ))}
      </ScrollView>

      <ActionStrip
        actions={[
          { id: 'check-in', label: 'Confirmar presença', icon: 'checkmark-done', tint: colors.client },
          { id: 'cancel', label: 'Avisar falta', icon: 'alert-circle', tint: colors.warn },
          { id: 'reschedule', label: 'Reagendar aula', icon: 'swap-horizontal', tint: colors.accent }
        ]}
      />

      <SectionTitle title="Próximas aulas" subtitle="Visual idêntico à App Studio" />
      {clientBookings.map(booking => (
        <ScheduleCard
          key={booking.id}
          {...booking}
          studio={`Coach ${booking.coach}`}
          actionPrimary={{ label: 'Ver detalhes', onPress: () => {} }}
          actionSecondary={{ label: 'Contactar estúdio', onPress: () => {} }}
        />
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
