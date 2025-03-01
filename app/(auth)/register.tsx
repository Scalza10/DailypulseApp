import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, View, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Check your email to confirm your account');
    } catch (error: any) {
      const message = error?.message || 'An error occurred during registration';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ThemedText style={[styles.title, isDark && styles.titleDark]}>
        Create Account
      </ThemedText>

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Email"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Password"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        placeholder="Confirm Password"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
      </TouchableOpacity>

      <Link href="/login" style={styles.link}>
        <ThemedText style={[styles.linkText, isDark && styles.linkTextDark]}>
          Already have an account? Login
        </ThemedText>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
  button: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#6B7280',
    fontSize: 16,
  },
  linkTextDark: {
    color: '#9CA3AF',
  },
}); 