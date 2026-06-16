import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors, spacing, radius } from '../theme';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp: Date;
}

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  orientation: string;
  ageRangeMin: string;
  ageRangeMax: string;
  matchPhilosophy: 'opposites' | 'similar' | '';
  responses: { question: string; answer: string }[];
}

// The system prompt that makes dAite's agent feel warm and intentional
const SYSTEM_PROMPT = `You are dAite's matchmaker — a warm, perceptive, and direct AI that helps people find genuine romantic connections in Mumbai. Your job is to understand who this person truly is, not just their stats.

You are conducting a structured onboarding conversation to build their profile. Follow this exact sequence:

1. Ask for their first name warmly.
2. Ask their age.
3. Ask their gender — keep it open and relaxed. Example: "How do you identify — man, woman, or something else?"
4. Ask who they want to meet — men, women, or open to both. Keep it casual and non-judgmental.
5. Ask what age range they're open to. Example: "What age range are you open to? Like 24 to 32, or something wider?"
6. Ask which philosophy they believe in — keep it fun and light. Example: "Quick one — do you believe opposites attract, or that similar people make better matches?"
7. Ask what they're looking for — long-term relationship, something serious but open, not sure yet.
8. Ask one revealing personality question. Example: "What does a perfect Sunday look like for you?"
9. Ask what they genuinely value in a partner — character, not looks. Push for specifics.
10. Ask one dealbreaker — what's a non-negotiable.
11. Give a brief warm closing summary referencing their philosophy choice, and tell them dAite will now find their best matches.

Rules:
- Ask ONE question at a time. Never bundle multiple questions.
- Keep responses short — 1-3 sentences max.
- Be conversational, warm, and occasionally witty. Not corporate.
- Never use bullet points or numbered lists.
- When you have all 10 pieces of information, end with: [PROFILE_COMPLETE] on a new line, followed by a JSON object with keys: name, age, gender, orientation, age_range_min, age_range_max, match_philosophy (value must be exactly "opposites" or "similar"), looking_for, personality_snapshot, partner_values, dealbreaker.
- Do not mention AI, Claude, or Anthropic.`;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// TODO: move to env / backend — never expose in production
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0-6 steps
  const [inputEnabled, setInputEnabled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const typingOpacity = useRef(new Animated.Value(0)).current;
  const conversationHistory = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => {
    // Start the conversation
    startConversation();
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const animateTyping = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(typingOpacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopTyping = () => {
    typingOpacity.stopAnimation();
    typingOpacity.setValue(0);
  };

  const startConversation = async () => {
    setLoading(true);
    animateTyping();

    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 800));

    const openingMessage = "Hey — I'm your dAite matchmaker. I'll ask you a few questions to find people who are genuinely right for you. This takes about 2 minutes.\n\nLet's start simple — what's your first name?";

    stopTyping();
    addAgentMessage(openingMessage);
    setLoading(false);
    setInputEnabled(true);

    conversationHistory.current.push({
      role: 'assistant',
      content: openingMessage,
    });
  };

  const addAgentMessage = (text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'agent',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setInputEnabled(false);
    addUserMessage(userText);

    conversationHistory.current.push({
      role: 'user',
      content: userText,
    });

    setLoading(true);
    animateTyping();

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: conversationHistory.current,
        }),
      });

      const data = await response.json();
      const agentText: string = data.content?.[0]?.text || "Sorry, I didn't catch that. Can you try again?";

      stopTyping();

      // Check if profile is complete
      if (agentText.includes('[PROFILE_COMPLETE]')) {
        const parts = agentText.split('[PROFILE_COMPLETE]');
        const displayText = parts[0].trim();

        if (displayText) {
          addAgentMessage(displayText);
        }

        conversationHistory.current.push({
          role: 'assistant',
          content: agentText,
        });

        setProgress(6);

        // Extract JSON profile
        try {
          const jsonMatch = parts[1]?.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const profileData = JSON.parse(jsonMatch[0]);
            setTimeout(() => {
              onComplete({
                name: profileData.name || '',
                age: profileData.age || '',
                gender: profileData.gender || '',
                orientation: profileData.orientation || '',
                ageRangeMin: profileData.age_range_min || '18',
                ageRangeMax: profileData.age_range_max || '40',
                matchPhilosophy: profileData.match_philosophy === 'opposites' ? 'opposites' : 'similar',
                responses: [
                  { question: 'Looking for', answer: profileData.looking_for || '' },
                  { question: 'Personality', answer: profileData.personality_snapshot || '' },
                  { question: 'Partner values', answer: profileData.partner_values || '' },
                  { question: 'Dealbreaker', answer: profileData.dealbreaker || '' },
                ],
              });
            }, 2000);
          }
        } catch {
          setTimeout(() => onComplete({ name: '', age: '', gender: '', orientation: '', ageRangeMin: '18', ageRangeMax: '40', matchPhilosophy: '', responses: [] }), 2000);
        }
      } else {
        addAgentMessage(agentText);
        conversationHistory.current.push({
          role: 'assistant',
          content: agentText,
        });
        setProgress(prev => Math.min(prev + 1, 5));
        setInputEnabled(true);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } catch {
      stopTyping();
      addAgentMessage("Something went wrong. Let's try that again.");
      setInputEnabled(true);
      setLoading(false);
    }
  };

  const progressWidth = `${(progress / 6) * 100}%`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.6} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>dAite</Text>
          <Text style={styles.headerSub}>your matchmaker</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth as any }]} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <View style={styles.agentBubbleWrap}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>d</Text>
            </View>
            <Animated.View style={[styles.typingBubble, { opacity: typingOpacity }]}>
              <Text style={styles.typingDots}>● ● ●</Text>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputArea}>
        <TextInput
          ref={inputRef}
          style={[styles.input, !inputEnabled && styles.inputDisabled]}
          placeholder={inputEnabled ? "Type your answer…" : ""}
          placeholderTextColor={colors.gray400}
          value={input}
          onChangeText={setInput}
          editable={inputEnabled}
          multiline
          maxLength={300}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading || !inputEnabled}
          activeOpacity={0.7}
          style={[
            styles.sendBtn,
            (!input.trim() || loading || !inputEnabled) && styles.sendBtnDisabled,
          ]}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isAgent = message.role === 'agent';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  if (isAgent) {
    return (
      <Animated.View
        style={[
          styles.agentBubbleWrap,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarText}>d</Text>
        </View>
        <View style={styles.agentBubble}>
          <Text style={styles.agentText}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.userBubbleWrap,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 40,
  },
  backText: {
    fontSize: 22,
    color: colors.black,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 11,
    color: colors.gray400,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerRight: {
    width: 40,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.black,
    borderRadius: 2,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  agentBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    maxWidth: '85%',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  agentAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
  },
  agentBubble: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    flex: 1,
  },
  agentText: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  typingBubble: {
    backgroundColor: colors.offWhite,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  typingDots: {
    fontSize: 10,
    color: colors.gray400,
    letterSpacing: 3,
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.black,
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  userText: {
    fontSize: 15,
    color: colors.white,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.offWhite,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: colors.black,
    letterSpacing: -0.1,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.gray200,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
  },
});
