import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { signInWithOTP, verifyOTP } from '../lib/supabase';
import { Button } from '../components/Button';

type AuthStep = 'email' | 'otp';

interface AuthScreenProps {
  onAuthenticated: () => void;
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onBack }) => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOTP = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await signInWithOTP(email);
    setLoading(false);

    if (error) {
      setError('Could not send code. Try again.');
      return;
    }

    // Animate to OTP step
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep('otp');
      slideAnim.setValue(1);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits filled
    if (newOtp.every(d => d !== '') && value !== '') {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOTPKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code: string) => {
    setLoading(true);
    setError('');

    const { data, error } = await verifyOTP(email, code);
    setLoading(false);

    if (error || !data?.user) {
      setError('Incorrect code. Try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      return;
    }

    onAuthenticated();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-40, 0, 40],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Back button */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.6}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Animated.View
        style={[styles.content, { opacity: 1, transform: [{ translateX }] }]}
      >
        {step === 'email' ? (
          <>
            <Text style={styles.eyebrow}>Step 1 of 2</Text>
            <Text style={styles.heading}>What's your email?</Text>
            <Text style={styles.subtext}>
              We'll send a code to verify it's you. No passwords, ever.
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="you@example.com"
                placeholderTextColor={colors.gray400}
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              label="Send code"
              onPress={handleSendOTP}
              loading={loading}
              disabled={!email}
              style={styles.btn}
            />
          </>
        ) : (
          <>
            <Text style={styles.eyebrow}>Step 2 of 2</Text>
            <Text style={styles.heading}>Check your inbox</Text>
            <Text style={styles.subtext}>
              We sent a sign-in link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.magicLinkCard}>
              <Text style={styles.magicLinkIcon}>✉️</Text>
              <Text style={styles.magicLinkText}>
                Open the email and tap{'\n'}<Text style={styles.magicLinkBold}>"Sign in"</Text> to continue.
              </Text>
              <Text style={styles.magicLinkSub}>
                The link expires in 1 hour.
              </Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleSendOTP}
              style={styles.resendBtn}
              activeOpacity={0.6}
            >
              <Text style={styles.resendText}>Resend link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setStep('email'); }}
              style={styles.resendBtn}
              activeOpacity={0.6}
            >
              <Text style={styles.resendText}>Wrong email? Go back</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 48,
  },
  backBtn: {
    marginBottom: spacing.xxl,
  },
  backText: {
    fontSize: 24,
    color: colors.black,
  },
  content: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: 16,
    color: colors.gray600,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emailHighlight: {
    color: colors.black,
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.offWhite,
  },
  inputError: {
    borderColor: colors.error,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    backgroundColor: colors.offWhite,
  },
  otpBoxFilled: {
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  otpBoxError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.md,
    letterSpacing: -0.1,
  },
  verifying: {
    fontSize: 14,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  btn: {
    width: '100%',
    marginTop: spacing.sm,
  },
  magicLinkCard: {
    backgroundColor: colors.offWhite,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  magicLinkIcon: {
    fontSize: 36,
  },
  magicLinkText: {
    fontSize: 16,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  magicLinkBold: {
    fontWeight: '700',
  },
  magicLinkSub: {
    fontSize: 13,
    color: colors.gray400,
    textAlign: 'center',
  },
  resendBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.gray400,
    letterSpacing: -0.1,
  },
});
