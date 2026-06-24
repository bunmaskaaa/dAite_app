import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen, UserProfile } from './src/screens/OnboardingScreen';
import { MatchFeedScreen, Match } from './src/screens/MatchFeedScreen';
import { MatchDetailScreen } from './src/screens/MatchDetailScreen';
import { supabase, upsertProfile, getProfile, getCurrentUser, embedProfile } from './src/lib/supabase';
import { colors } from './src/theme';

type AppScreen = 'splash' | 'welcome' | 'auth' | 'onboarding' | 'feed' | 'match_detail';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);

  // Check for existing session on app start (after splash)
  const checkSession = async () => {
    setCheckingSession(true);
    const user = await getCurrentUser();
    if (user) {
      const { data: profile } = await getProfile(user.id);
      if (profile?.onboarding_complete) {
        setUserProfile({
          name: profile.name || '',
          age: String(profile.age || ''),
          gender: profile.gender || '',
          orientation: profile.orientation || '',
          ageRangeMin: String(profile.age_range_min || '18'),
          ageRangeMax: String(profile.age_range_max || '40'),
          matchPhilosophy: profile.match_philosophy === 'opposites' ? 'opposites' : 'similar',
          responses: [],
        });
        setScreen('feed');
      } else if (user) {
        setScreen('onboarding');
      }
    } else {
      setScreen('welcome');
    }
    setCheckingSession(false);
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
  setUserProfile(profile);
  const user = await getCurrentUser();
  if (user) {
    await upsertProfile({
      id: user.id,
      email: user.email || '',
      name: profile.name,
      age: parseInt(profile.age, 10) || 0,
      gender: profile.gender,
      orientation: profile.orientation,
      age_range_min: parseInt(profile.ageRangeMin, 10) || 18,
      age_range_max: parseInt(profile.ageRangeMax, 10) || 40,
      match_philosophy: profile.matchPhilosophy,
      industry: profile.industry,
      intent: profile.intent,
      vibe: profile.vibe,
      energy: profile.energy,
      humor: profile.humor,
      decision_style: profile.decisionStyle,
      sunday_pace: profile.sundayPace,
      life_chapter: profile.lifeChapter,
      interests: profile.interests,
      hangout_style: profile.hangoutStyle,
      communication_style: profile.communicationStyle,
      social_battery: profile.socialBattery,
      cancel_reason: profile.cancelReason,
      social_role: profile.socialRole,
      conflict_style: profile.conflictStyle,
      values_in_others: profile.valuesInOthers,
      self_traits: profile.selfTraits,
      looking_for: profile.responses.find(r => r.question === 'Looking for')?.answer || '',
      onboarding_complete: true,
    });
    await embedProfile(user.id);
  }
  setScreen('feed');
};

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return (
          <SplashScreen
            onFinish={() => {
              if (checkingSession) {
                setScreen('welcome'); // fallback
              } else {
                checkSession();
              }
            }}
          />
        );

      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => setScreen('auth')}
            onSignIn={() => setScreen('auth')}
          />
        );

      case 'auth':
        return (
          <AuthScreen
            onAuthenticated={() => setScreen('onboarding')}
            onBack={() => setScreen('welcome')}
          />
        );

      case 'onboarding':
        return (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onBack={() => setScreen('auth')}
          />
        );

      case 'feed':
        return (
          <MatchFeedScreen
            userProfile={userProfile!}
            onMatchPress={(match) => {
              setSelectedMatch(match);
              setScreen('match_detail');
            }}
            onProfilePress={() => {}}
          />
        );

      case 'match_detail':
        return (
          <MatchDetailScreen
            match={selectedMatch!}
            onBack={() => setScreen('feed')}
            onCommit={(match) => {
              console.log('Introduction sent for:', match.name);
            }}
          />
        );
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.black} />
      </View>
    );
  }

  return <>{renderScreen()}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
