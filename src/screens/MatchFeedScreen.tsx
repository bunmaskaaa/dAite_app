import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { UserProfile } from './OnboardingScreen';

const { width } = Dimensions.get('window');

export interface Match {
  id: string;
  name: string;
  age: number;
  area: string; // Mumbai neighbourhood
  compatibilityScore: number;
  matchReason: string; // AI-generated 1-liner
  sharedValues: string[];
  ghostingRisk: 'low' | 'medium' | 'high';
  profession: string;
}

interface MatchFeedScreenProps {
  userProfile: UserProfile;
  onMatchPress: (match: Match) => void;
  onProfilePress: () => void;
}

// Mock matches — will be replaced by real API call to FastAPI backend
const generateMockMatches = (profile: UserProfile): Match[] => [
  {
    id: '1',
    name: 'Aanya',
    age: 27,
    area: 'Bandra West',
    compatibilityScore: 91,
    matchReason: 'You both treat Sundays like a religion — slow mornings, zero plans.',
    sharedValues: ['Ambition', 'Honesty', 'Growth'],
    ghostingRisk: 'low',
    profession: 'Product Designer',
  },
  {
    id: '2',
    name: 'Priya',
    age: 25,
    area: 'Powai',
    compatibilityScore: 84,
    matchReason: 'Her idea of a good evening is exactly yours — deep conversation over chai.',
    sharedValues: ['Curiosity', 'Honesty'],
    ghostingRisk: 'low',
    profession: 'Data Scientist',
  },
  {
    id: '3',
    name: 'Riya',
    age: 28,
    area: 'Andheri',
    compatibilityScore: 78,
    matchReason: 'Both of you value building something meaningful over comfort.',
    sharedValues: ['Ambition', 'Independence'],
    ghostingRisk: 'medium',
    profession: 'Startup Founder',
  },
];

export const MatchFeedScreen: React.FC<MatchFeedScreenProps> = ({
  userProfile,
  onMatchPress,
  onProfilePress,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate API call to match engine
    const load = async () => {
      await new Promise(r => setTimeout(r, 1800));
      const mockMatches = generateMockMatches(userProfile);
      setMatches(mockMatches);
      setLoading(false);

      Animated.stagger(150, [
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(listOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    };
    load();
  }, []);

  if (loading) {
    return <LoadingState name={userProfile.name} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {userProfile.name?.split(' ')[0] || 'there'}.
          </Text>
          <Text style={styles.subGreeting}>
            {matches.length} introduction{matches.length !== 1 ? 's' : ''} waiting for you.
          </Text>
        </View>
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.7} style={styles.avatarBtn}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name?.[0]?.toUpperCase() || 'Y'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Match cards */}
      <Animated.ScrollView
        style={[styles.list, { opacity: listOpacity }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section label */}
        <Text style={styles.sectionLabel}>Your introductions</Text>

        {matches.map((match, index) => (
          <MatchCard
            key={match.id}
            match={match}
            index={index}
            onPress={() => onMatchPress(match)}
          />
        ))}

        {/* Bottom note */}
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            New introductions every 48 hours.{'\n'}Quality over quantity — always.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const MatchCard: React.FC<{
  match: Match;
  index: number;
  onPress: () => void;
}> = ({ match, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const scoreColor = match.compatibilityScore >= 85
    ? colors.black
    : match.compatibilityScore >= 75
    ? colors.gray600
    : colors.gray400;

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.92}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardInitialBlock}>
            <Text style={styles.cardInitial}>{match.name[0]}</Text>
          </View>
          <View style={styles.cardTopInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{match.name}</Text>
              <Text style={styles.cardAge}>{match.age}</Text>
            </View>
            <Text style={styles.cardMeta}>{match.profession} · {match.area}</Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {match.compatibilityScore}
            </Text>
            <Text style={styles.scoreLabel}>match</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Match reason */}
        <Text style={styles.matchReason}>"{match.matchReason}"</Text>

        {/* Shared values */}
        <View style={styles.valuesRow}>
          {match.sharedValues.map(v => (
            <View key={v} style={styles.valuePill}>
              <Text style={styles.valuePillText}>{v}</Text>
            </View>
          ))}
          {match.ghostingRisk === 'low' && (
            <View style={[styles.valuePill, styles.antiGhostPill]}>
              <Text style={styles.antiGhostText}>Low ghost risk</Text>
            </View>
          )}
        </View>

        {/* CTA */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardCTA}>See introduction →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoadingState: React.FC<{ name: string }> = ({ name }) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const [loadingText, setLoadingText] = useState('Reading your profile…');

  const loadingSteps = [
    'Reading your profile…',
    'Searching Mumbai…',
    'Scoring compatibility…',
    'Checking ghosting signals…',
    'Finalising your introductions…',
  ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % loadingSteps.length;
      setLoadingText(loadingSteps[step]);
    }, 340);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ opacity: pulseAnim }}>
        <Text style={styles.loadingLogo}>dAite</Text>
      </Animated.View>
      <Text style={styles.loadingText}>{loadingText}</Text>
    </View>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.8,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 4,
    letterSpacing: -0.1,
  },
  avatarBtn: {
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.gray400,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray100,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInitialBlock: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  cardTopInfo: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.4,
  },
  cardAge: {
    fontSize: 14,
    color: colors.gray400,
    fontWeight: '400',
  },
  cardMeta: {
    fontSize: 13,
    color: colors.gray400,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  scoreBlock: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.gray400,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: spacing.md,
  },
  matchReason: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    fontStyle: 'italic',
    letterSpacing: -0.1,
    marginBottom: spacing.md,
  },
  valuesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  valuePill: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  valuePillText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  antiGhostPill: {
    borderColor: colors.black,
    backgroundColor: colors.black,
  },
  antiGhostText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '500',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  cardCTA: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  loadingLogo: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1.5,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray400,
    letterSpacing: 0.2,
  },
  bottomNote: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bottomNoteText: {
    fontSize: 13,
    color: colors.gray400,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});
