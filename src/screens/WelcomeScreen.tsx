import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { Button } from '../components/Button';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn }) => {
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Top section — wordmark */}
      <Animated.View style={[styles.topSection, { opacity: contentOpacity }]}>
        <Text style={styles.wordmark}>dAite</Text>
      </Animated.View>

      {/* Middle section — headline */}
      <Animated.View
        style={[
          styles.middleSection,
          { opacity: contentOpacity, transform: [{ translateY: contentY }] },
        ]}
      >
        {/* Three rotating value props */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>No swiping</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>No small talk</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>No ghosting</Text>
          </View>
        </View>

        <Text style={styles.headline}>Your AI matchmaker.{'\n'}You just show up.</Text>

        <Text style={styles.body}>
          dAite learns who you are through conversation — then introduces you to people who are genuinely right for you.
        </Text>
      </Animated.View>

      {/* Bottom section — CTAs */}
      <Animated.View style={[styles.bottomSection, { opacity: contentOpacity }]}>
        <Button label="Get started" onPress={onGetStarted} variant="primary" style={styles.primaryBtn} />
        <TouchableOpacity onPress={onSignIn} style={styles.signInBtn} activeOpacity={0.6}>
          <Text style={styles.signInText}>Already a member? <Text style={styles.signInTextBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
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
  topSection: {
    alignItems: 'flex-start',
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.8,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray600,
    letterSpacing: 0.1,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1.2,
    lineHeight: 42,
    marginBottom: spacing.lg,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray600,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  bottomSection: {
    gap: spacing.md,
  },
  primaryBtn: {
    width: '100%',
  },
  signInBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signInText: {
    fontSize: 15,
    color: colors.gray400,
    letterSpacing: -0.1,
  },
  signInTextBold: {
    color: colors.black,
    fontWeight: '600',
  },
});
