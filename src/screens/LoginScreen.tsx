import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Surface style={styles.card} elevation={4}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
              معمورة
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              نظام إدارة المخزون
            </Text>
            <Text variant="bodyMedium" style={styles.roleText}>
              تطبيق المراجع العام
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <TextInput
              label="اسم المستخدم"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              textAlign="right"
            />

            <TextInput
              label="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              textAlign="right"
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              تسجيل الدخول
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.footerText}>
              مخصص للمراجعين فقط
            </Text>
          </View>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 4,
  },
  roleText: {
    color: '#7c3aed',
    fontWeight: '600',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
  },
});

