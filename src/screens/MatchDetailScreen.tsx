import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { Match } from './MatchFeedScreen';

const { width, height } = Dimensions.get('window');

const getAvatarUrl = (name: string) =>
  `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(name)}&backgroundColor=f5f5f5&radius=50`;

interface MatchDetailScreenProps {
  match: Match;
  onBack: () => void;
  onCommit: (match: Match) => void;
}

export const MatchDetailScreen: React.FC<MatchDetailScreenProps> = ({
  match,
  onBack,
  onCommit,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(16)).current;
  const [commitModalVisible, setCommitModalVisible] = useState(false);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const scoreColor =
    match.compatibilityScore >= 85
      ? colors.black
      : match.compatibilityScore >= 75
      ? colors.gray600
      : colors.gray400;

  const handleCommit = () => {
    setCommitModalVisible(false);
    setCommitted(true);
    onCommit(match);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Sticky header on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyHeaderTitle}>{match.name}</Text>
      </Animated.View>

      {/* Back button */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.6}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}
        >
          {/* Hero section */}
          <View style={styles.hero}>
            <Image
              source={{ uri: getAvatarUrl(match.name) }}
              style={styles.heroAvatar}
            />
            <Text style={styles.heroName}>{match.name}</Text>
            <Text style={styles.heroMeta}>
              {match.age} · {match.profession} · {match.area}
            </Text>

            {/* Compatibility score ring */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreRing}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                  {match.compatibilityScore}
                </Text>
                <Text style={styles.scoreLabel}>compatibility</Text>
              </View>
            </View>
          </View>

          {/* Why you match */}
          <Section title="Why dAite thinks you match">
            <View style={styles.reasonCard}>
              <Text style={styles.reasonQuote}>"{match.matchReason}"</Text>
            </View>
          </Section>

          {/* Shared values */}
          <Section title="What you have in common">
            <View style={styles.valuesGrid}>
              {match.sharedValues.map((value, i) => (
                <ValueBlock key={i} value={value} index={i} />
              ))}
            </View>
          </Section>

          {/* Anti-ghosting analysis */}
          <Section title="Ghosting analysis">
            <GhostingCard risk={match.ghostingRisk} />
          </Section>

          {/* About section — placeholder until real profiles exist */}
          <Section title="About">
            <Text style={styles.aboutText}>
              {match.name} is a {match.profession} based in {match.area}, Mumbai.
              Profile details will appear here once they complete their onboarding conversation with dAite.
            </Text>
          </Section>

          {/* Commitment CTA */}
          <View style={styles.ctaSection}>
            {committed ? (
              <View style={styles.committedCard}>
                <Text style={styles.committedTitle}>Introduction sent ✓</Text>
                <Text style={styles.committedSub}>
                  {match.name} will be notified. dAite will follow up with both of you in 48 hours.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.ctaNote}>
                  Ready to meet {match.name}? dAite will send an introduction to both of you and follow up to make sure it doesn't go nowhere.
                </Text>
                <TouchableOpacity
                  style={styles.commitBtn}
                  onPress={() => setCommitModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.commitBtnText}>Send introduction</Text>
                </TouchableOpacity>
                <Text style={styles.ctaFineprint}>
                  Both sides must agree before any contact details are shared.
                </Text>
              </>
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Commit confirmation modal */}
      <Modal
        visible={commitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Send introduction?</Text>
            <Text style={styles.modalBody}>
              dAite will notify {match.name} that you're interested. If they agree, you'll both be connected.
            </Text>
            <Text style={styles.modalCommitment}>
              By proceeding, you commit to responding within 48 hours. No ghosting.
            </Text>
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={handleCommit}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmText}>Yes, send it</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCommitModalVisible(false)}
              style={styles.modalCancelBtn}
              activeOpacity={0.6}
            >
              <Text style={styles.modalCancelText}>Not yet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Section wrapper
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{title}</Text>
    {children}
  </View>
);

// Value block
const ValueBlock: React.FC<{ value: string; index: number }> = ({ value, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.valueBlock, { opacity: fadeAnim }]}>
      <Text style={styles.valueBlockText}>{value}</Text>
    </Animated.View>
  );
};

// Ghosting risk card
const GhostingCard: React.FC<{ risk: 'low' | 'medium' | 'high' }> = ({ risk }) => {
  const config = {
    low: {
      label: 'Low risk',
      description: 'Based on their response patterns and profile depth, this person is unlikely to ghost.',
      signals: ['Detailed onboarding responses', 'Consistent values alignment', 'Active on platform'],
      bg: colors.black,
      text: colors.white,
    },
    medium: {
      label: 'Medium risk',
      description: 'Some signals suggest moderate engagement. dAite will follow up after introduction.',
      signals: ['Moderate profile detail', 'Some values alignment'],
      bg: colors.gray800,
      text: colors.white,
    },
    high: {
      label: 'Higher risk',
      description: 'Proceed with awareness. dAite will actively follow up to keep things moving.',
      signals: ['Limited profile detail'],
      bg: colors.gray600,
      text: colors.white,
    },
  };

  const c = config[risk];

  return (
    <View style={[styles.ghostingCard, { backgroundColor: c.bg }]}>
      <Text style={[styles.ghostingLabel, { color: c.text }]}>{c.label}</Text>
      <Text style={[styles.ghostingDesc, { color: risk === 'low' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.65)' }]}>
        {c.description}
      </Text>
      <View style={styles.ghostingSignals}>
        {c.signals.map((s, i) => (
          <Text key={i} style={[styles.ghostingSignal, { color: risk === 'low' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)' }]}>
            ✓ {s}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 52,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    alignItems: 'center',
  },
  stickyHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.3,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: spacing.lg,
    zIndex: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.offWhite,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  heroMeta: {
    fontSize: 14,
    color: colors.gray400,
    letterSpacing: -0.1,
    marginBottom: spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.gray400,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  reasonCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  reasonQuote: {
    fontSize: 15,
    color: colors.gray600,
    lineHeight: 22,
    fontStyle: 'italic',
    letterSpacing: -0.1,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  valueBlock: {
    borderWidth: 1.5,
    borderColor: colors.black,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  valueBlockText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.1,
  },
  ghostingCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  ghostingLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: spacing.sm,
  },
  ghostingDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
    letterSpacing: -0.1,
  },
  ghostingSignals: {
    gap: spacing.xs,
  },
  ghostingSignal: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  aboutText: {
    fontSize: 15,
    color: colors.gray600,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  ctaSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  ctaNote: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  commitBtn: {
    backgroundColor: colors.black,
    borderRadius: radius.full,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  commitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.2,
  },
  ctaFineprint: {
    fontSize: 12,
    color: colors.gray400,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  committedCard: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  committedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.4,
  },
  committedSub: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.6,
    marginBottom: spacing.md,
  },
  modalBody: {
    fontSize: 15,
    color: colors.gray600,
    lineHeight: 22,
    letterSpacing: -0.1,
    marginBottom: spacing.md,
  },
  modalCommitment: {
    fontSize: 13,
    color: colors.black,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  modalConfirmBtn: {
    backgroundColor: colors.black,
    borderRadius: radius.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.2,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modalCancelText: {
    fontSize: 15,
    color: colors.gray400,
  },
});
