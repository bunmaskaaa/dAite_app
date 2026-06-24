import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  // Basics
  name: string;
  age: string;
  gender: string;
  industry: string;
  // Intent
  intent: string[];
  // Personality
  vibe: string;
  energy: string;
  humor: string;
  decisionStyle: string;
  // Lifestyle
  sundayPace: string;
  lifeChapter: string;
  interests: string[];
  hangoutStyle: string;
  // Social
  communicationStyle: string;
  socialBattery: string;
  cancelReason: string;
  socialRole: string;
  // Values
  conflictStyle: string;
  valuesInOthers: string[];
  selfTraits: string[];
  // Legacy fields kept for App.tsx compatibility
  orientation: string;
  ageRangeMin: string;
  ageRangeMax: string;
  matchPhilosophy: 'similar' | 'opposites';
  responses: { question: string; answer: string }[];
}

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

// ─── Question definitions ──────────────────────────────────────────────────────

type QuestionType = 'single' | 'multi' | 'grid';

interface Question {
  id: keyof UserProfile | string;
  section: string;
  question: string;
  sub?: string;
  type: QuestionType;
  max?: number;
  options: { label: string; emoji: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'age',
    section: 'Basics',
    question: 'How old are you?',
    type: 'grid',
    options: [
      { emoji: '🌱', label: '18 – 24' },
      { emoji: '⚡', label: '25 – 29' },
      { emoji: '🔥', label: '30 – 35' },
      { emoji: '✨', label: '36 – 45' },
    ],
  },
  {
    id: 'gender',
    section: 'Basics',
    question: 'How do you identify?',
    type: 'single',
    options: [
      { emoji: '👨', label: 'Man' },
      { emoji: '👩', label: 'Woman' },
      { emoji: '🌈', label: 'Non-binary' },
      { emoji: '🤫', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'industry',
    section: 'Basics',
    question: 'What do you do for work?',
    type: 'single',
    options: [
      { emoji: '💻', label: 'Tech & startups' },
      { emoji: '💰', label: 'Finance & banking' },
      { emoji: '🎨', label: 'Creative & media' },
      { emoji: '🏥', label: 'Healthcare' },
      { emoji: '🎓', label: 'Education & research' },
      { emoji: '🏗️', label: 'Other' },
    ],
  },
  {
    id: 'intent',
    section: 'Intent',
    question: 'What brings you to dAite?',
    sub: 'Select up to 2',
    type: 'multi',
    max: 2,
    options: [
      { emoji: '👫', label: 'Meet new people' },
      { emoji: '💬', label: 'Meaningful conversations' },
      { emoji: '💘', label: 'Meet someone special' },
      { emoji: '🌆', label: 'Explore Mumbai more' },
      { emoji: '🆕', label: 'Just moved here' },
    ],
  },
  {
    id: 'vibe',
    section: 'Personality',
    question: 'Your vibe in one word?',
    type: 'single',
    options: [
      { emoji: '🏃', label: 'Hustler' },
      { emoji: '🧭', label: 'Explorer' },
      { emoji: '🦋', label: 'Social butterfly' },
      { emoji: '🌊', label: 'Chill' },
    ],
  },
  {
    id: 'energy',
    section: 'Personality',
    question: 'Are you more...',
    type: 'single',
    options: [
      { emoji: '📚', label: 'Introverted — recharge alone' },
      { emoji: '🌗', label: 'Ambivert — bit of both' },
      { emoji: '🎉', label: 'Extroverted — energized by people' },
    ],
  },
  {
    id: 'humor',
    section: 'Personality',
    question: 'Your humor style?',
    type: 'single',
    options: [
      { emoji: '😅', label: 'Self-deprecating' },
      { emoji: '🪨', label: 'Deadpan / dry' },
      { emoji: '🌀', label: 'Absurd / random' },
      { emoji: '🎭', label: 'Situational — I read the room' },
    ],
  },
  {
    id: 'decisionStyle',
    section: 'Personality',
    question: 'Your opinions are usually guided by...',
    type: 'single',
    options: [
      { emoji: '🔍', label: 'Logic & facts' },
      { emoji: '💗', label: 'Emotions & feelings' },
      { emoji: '🤹', label: 'Mix, depends on the mood' },
    ],
  },
  {
    id: 'sundayPace',
    section: 'Lifestyle',
    question: 'Your typical Sunday looks like...',
    type: 'single',
    options: [
      { emoji: '📋', label: 'Planned out & productive' },
      { emoji: '🌅', label: 'Slow start, spontaneous by evening' },
      { emoji: '🌊', label: 'Completely unstructured' },
      { emoji: '📅', label: 'Depends on the week' },
    ],
  },
  {
    id: 'lifeChapter',
    section: 'Lifestyle',
    question: 'Which life chapter are you in?',
    type: 'single',
    options: [
      { emoji: '🏗️', label: 'Building hard — head down, big goals' },
      { emoji: '⚖️', label: 'Finding balance — work + living well' },
      { emoji: '🧭', label: 'Exploring — figuring things out' },
      { emoji: '😌', label: 'Coasting — happy where I am' },
    ],
  },
  {
    id: 'interests',
    section: 'Lifestyle',
    question: 'What do you enjoy in your free time?',
    sub: 'Select up to 4',
    type: 'multi',
    max: 4,
    options: [
      { emoji: '☕', label: 'Tapri chai runs' },
      { emoji: '🌊', label: 'Marine Drive walks' },
      { emoji: '🎵', label: 'Live music & gigs' },
      { emoji: '💪', label: 'Gym & fitness' },
      { emoji: '🍵', label: 'Café hopping' },
      { emoji: '📚', label: 'Reading' },
      { emoji: '🎨', label: 'Art & design' },
      { emoji: '🎮', label: 'Gaming' },
      { emoji: '✈️', label: 'Traveling' },
      { emoji: '🍜', label: 'Food spotting' },
      { emoji: '📸', label: 'Photography' },
      { emoji: '🧘', label: 'Yoga / meditation' },
    ],
  },
  {
    id: 'hangoutStyle',
    section: 'Lifestyle',
    question: 'Your ideal Mumbai hangout?',
    type: 'single',
    options: [
      { emoji: '🌅', label: 'Juhu beach at 6am' },
      { emoji: '🥂', label: 'Bandra brunch spot' },
      { emoji: '🎵', label: 'Underground gig in Lower Parel' },
      { emoji: '🍵', label: 'Irani café, old books, no plan' },
    ],
  },
  {
    id: 'communicationStyle',
    section: 'Social',
    question: 'How do you keep in touch with people you like?',
    type: 'single',
    options: [
      { emoji: '🎙️', label: 'Voice notes / calls' },
      { emoji: '💬', label: 'Texts — quick and frequent' },
      { emoji: '😂', label: 'Memes and reels' },
      { emoji: '🦇', label: 'Go MIA but show up fully' },
    ],
  },
  {
    id: 'socialBattery',
    section: 'Social',
    question: 'After a big social event, you need...',
    type: 'single',
    options: [
      { emoji: '🎊', label: 'More plans — just getting started' },
      { emoji: '🛋️', label: 'One quiet day to reset' },
      { emoji: '🐢', label: 'A few days of hermit mode' },
      { emoji: '🎲', label: 'Depends on the people' },
    ],
  },
  {
    id: 'cancelReason',
    section: 'Social',
    question: "You'd cancel plans if...",
    type: 'single',
    options: [
      { emoji: '👨‍👩‍👧', label: 'A family member needs you' },
      { emoji: '😶', label: "You're just not feeling it" },
      { emoji: '💼', label: 'Work demands it' },
      { emoji: '🔒', label: "Honestly, you rarely cancel" },
    ],
  },
  {
    id: 'socialRole',
    section: 'Social',
    question: 'Friends call you when...',
    type: 'single',
    options: [
      { emoji: '🧠', label: 'They need honest advice' },
      { emoji: '😂', label: 'They want to laugh and vent' },
      { emoji: '🔧', label: 'They need help figuring something out' },
      { emoji: '🫂', label: 'They just want good company' },
    ],
  },
  {
    id: 'conflictStyle',
    section: 'Values',
    question: 'When something bothers you, you...',
    type: 'single',
    options: [
      { emoji: '💬', label: 'Say it directly' },
      { emoji: '🤌', label: 'Hint at it and hope they get it' },
      { emoji: '🧘', label: 'Process alone first, then talk' },
      { emoji: '🫥', label: "Avoid it unless it's serious" },
    ],
  },
  {
    id: 'valuesInOthers',
    section: 'Values',
    question: 'Qualities you value most in people?',
    sub: 'Select up to 3',
    type: 'multi',
    max: 3,
    options: [
      { emoji: '✨', label: 'Authentic' },
      { emoji: '👂', label: 'Attentive' },
      { emoji: '⚡', label: 'Charismatic' },
      { emoji: '🌿', label: 'Grounded' },
      { emoji: '😄', label: 'Funny' },
      { emoji: '🧠', label: 'Intelligent' },
      { emoji: '🔥', label: 'Warm' },
      { emoji: '🌈', label: 'Optimistic' },
      { emoji: '🎯', label: 'Driven' },
      { emoji: '🕊️', label: 'Calm' },
    ],
  },
  {
    id: 'selfTraits',
    section: 'Values',
    question: 'What do your friends love about you?',
    sub: 'Select up to 3',
    type: 'multi',
    max: 3,
    options: [
      { emoji: '✨', label: 'Authentic' },
      { emoji: '👂', label: 'Attentive' },
      { emoji: '⚡', label: 'Charismatic' },
      { emoji: '🌿', label: 'Grounded' },
      { emoji: '😄', label: 'Funny' },
      { emoji: '🧠', label: 'Intelligent' },
      { emoji: '🔥', label: 'Warm' },
      { emoji: '🌈', label: 'Optimistic' },
      { emoji: '🎯', label: 'Driven' },
      { emoji: '🕊️', label: 'Calm' },
    ],
  },
];

const TOTAL = QUESTIONS.length;

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingScreen({ onComplete, onBack }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const q = QUESTIONS[step];
  const current = answers[q.id];
  const isMulti = q.type === 'multi';
  const selectedArr: string[] = isMulti ? (current as string[] ?? []) : [];
  const selectedSingle: string = !isMulti ? (current as string ?? '') : '';
  const hasAnswer = isMulti ? selectedArr.length > 0 : !!selectedSingle;

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSingle = (label: string) => {
    setAnswers(prev => ({ ...prev, [q.id]: label }));
  };

  const handleMulti = (label: string) => {
    const prev = (answers[q.id] as string[] ?? []);
    if (prev.includes(label)) {
      setAnswers(a => ({ ...a, [q.id]: prev.filter(x => x !== label) }));
    } else if (prev.length < (q.max ?? 99)) {
      setAnswers(a => ({ ...a, [q.id]: [...prev, label] }));
    }
  };

  const goNext = () => {
    if (!hasAnswer) return;
    if (step < TOTAL - 1) {
      animateTransition(() => setStep(s => s + 1));
    } else {
      handleFinish();
    }
  };

  const goBack = () => {
    if (step === 0) {
      onBack();
    } else {
      animateTransition(() => setStep(s => s - 1));
    }
  };

  const handleFinish = () => {
    const a = answers as any;
    const profile: UserProfile = {
      name: '',
      age: a.age ?? '',
      gender: a.gender ?? '',
      industry: a.industry ?? '',
      intent: a.intent ?? [],
      vibe: a.vibe ?? '',
      energy: a.energy ?? '',
      humor: a.humor ?? '',
      decisionStyle: a.decisionStyle ?? '',
      sundayPace: a.sundayPace ?? '',
      lifeChapter: a.lifeChapter ?? '',
      interests: a.interests ?? [],
      hangoutStyle: a.hangoutStyle ?? '',
      communicationStyle: a.communicationStyle ?? '',
      socialBattery: a.socialBattery ?? '',
      cancelReason: a.cancelReason ?? '',
      socialRole: a.socialRole ?? '',
      conflictStyle: a.conflictStyle ?? '',
      valuesInOthers: a.valuesInOthers ?? [],
      selfTraits: a.selfTraits ?? [],
      // Legacy compatibility
      orientation: '',
      ageRangeMin: '18',
      ageRangeMax: '45',
      matchPhilosophy: 'similar',
      responses: [
        { question: 'Looking for', answer: (a.intent ?? []).join(', ') },
        { question: 'Personality', answer: `${a.vibe}, ${a.energy}, ${a.humor}` },
        { question: 'Partner values', answer: (a.valuesInOthers ?? []).join(', ') },
        { question: 'Dealbreaker', answer: '' },
      ],
    };
    onComplete(profile);
  };

  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>dAite</Text>
        <Text style={styles.counter}>{step + 1} / {TOTAL}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Question content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.sectionLabel}>{q.section}</Text>
        <Text style={styles.questionText}>{q.question}</Text>
        {q.sub ? <Text style={styles.subText}>{q.sub}</Text> : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            q.type === 'grid' ? styles.gridContainer :
            q.type === 'multi' && q.options.length > 6 ? styles.tagContainer :
            styles.listContainer
          ]}
        >
          {q.options.map(opt => {
            const isSelected = isMulti
              ? selectedArr.includes(opt.label)
              : selectedSingle === opt.label;

            if (q.type === 'grid') {
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.gridOption, isSelected && styles.selectedOption]}
                  onPress={() => handleSingle(opt.label)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gridEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.gridLabel, isSelected && styles.selectedText]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            }

            if (q.type === 'multi' && q.options.length > 6) {
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.tag, isSelected && styles.selectedOption]}
                  onPress={() => handleMulti(opt.label)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isSelected && styles.selectedText]}>
                    {opt.emoji} {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.listOption, isSelected && styles.selectedOption]}
                onPress={() => isMulti ? handleMulti(opt.label) : handleSingle(opt.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optionLabel, isSelected && styles.selectedText]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Footer nav */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !hasAnswer && styles.continueBtnDisabled]}
          onPress={goNext}
          disabled={!hasAnswer}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>
            {step === TOTAL - 1 ? 'Find my matches' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 4,
    minWidth: 32,
  },
  backText: {
    fontSize: 20,
    color: '#888',
  },
  logo: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  counter: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#E8E6E0',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#999',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: 30,
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 18,
  },
  listContainer: {
    paddingTop: 12,
    gap: 8,
  },
  gridContainer: {
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagContainer: {
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E0DDD6',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  gridOption: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E0DDD6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#E0DDD6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tagText: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  selectedOption: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  optionEmoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  optionLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  gridEmoji: {
    fontSize: 24,
  },
  gridLabel: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  continueBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#D0CEC8',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
