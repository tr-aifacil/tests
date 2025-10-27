import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import SectionTitle from '../components/SectionTitle';
import HighlightCard from '../components/HighlightCard';
import supabase from '../lib/supabase';
import { useAuth } from '../store/auth';
import { colors } from '../theme/colors';

const reasonCopy = {
  booking: 'Reserva de aula',
  cancellation: 'Cancelamento com crédito',
  waitlist_promotion: 'Promoção da lista de espera',
  adjustment: 'Ajuste manual'
};

function formatLedgerDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ProfileScreen({ isFocused, profile }) {
  const { session, signOut, refreshProfile } = useAuth();
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [signingOut, setSigningOut] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setWalletBalance(0);
      setLedger([]);
      return;
    }

    setLoading(true);

    try {
      const { data: walletData, error: walletError } = await supabase
        .from('credit_wallet')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      setWalletBalance(walletData?.balance ?? 0);

      const { data: ledgerData, error: ledgerError } = await supabase
        .from('credit_ledger')
        .select('id, delta, reason, session_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (ledgerError) {
        throw ledgerError;
      }

      setLedger(ledgerData || []);
    } catch (error) {
      console.warn('Erro ao carregar perfil', error);
      Alert.alert('Erro', 'Não foi possível obter os dados de perfil.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isFocused || !userId) {
      return;
    }

    fetchData();
    refreshProfile(userId);
  }, [fetchData, isFocused, refreshProfile, userId]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.warn('Erro ao terminar sessão', error);
      Alert.alert('Erro', 'Não foi possível terminar sessão.');
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  const roleLabel = profile?.role === 'instructor'
    ? 'Professor(a)'
    : profile?.role === 'admin'
      ? 'Administrador(a)'
      : 'Cliente';

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <SectionTitle title="Perfil" subtitle="Dados sincronizados com o Supabase" />
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>{profile?.full_name || 'Utilizador'}</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{profile?.phone || 'Sem contacto definido'}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>Papel: {roleLabel}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 6 }}>{session?.user?.email}</Text>
        </View>
      </View>

      <SectionTitle title="Créditos" subtitle="Saldo actual e movimentos recentes" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 6 }}
      >
        <HighlightCard value={String(walletBalance)} label="Créditos disponíveis" accent={colors.highlight} />
      </ScrollView>

      {loading ? (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator color={colors.highlight} />
        </View>
      ) : null}

      <SectionTitle title="Movimentos" subtitle="Últimos 20 lançamentos" />
      <View style={{ paddingHorizontal: 20 }}>
        {(ledger || []).map(entry => (
          <View
            key={entry.id}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              marginBottom: 12,
              backgroundColor: colors.surfaceAlt
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {reasonCopy[entry.reason] || entry.reason}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              {formatLedgerDate(entry.created_at)}
            </Text>
            <Text style={{ color: entry.delta >= 0 ? colors.highlight : colors.warn, marginTop: 8, fontSize: 16, fontWeight: '700' }}>
              {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
            </Text>
          </View>
        ))}
        {!ledger.length && !loading ? (
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>Sem movimentos registados.</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13 }}>
              As reservas e cancelamentos vão aparecer aqui.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.warn,
            borderRadius: 18,
            paddingVertical: 14,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16 }}>
            {signingOut ? 'A terminar sessão...' : 'Terminar sessão'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
