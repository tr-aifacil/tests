import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors } from '../theme/colors';
import { useAuth } from '../store/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Introduz email e palavra-passe.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Não foi possível iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Studio Pilates</Text>
        <Text style={styles.subtitle}>Acede à tua agenda App Studio</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Palavra-passe"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          textContentType="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.buttonLabel}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  card: {
    width: '100%',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700'
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15
  },
  input: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  error: {
    color: colors.warn,
    marginBottom: 16,
    fontSize: 13
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.highlight,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16
  }
});
