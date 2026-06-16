import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen, UserProfile } from './src/screens/OnboardingScreen';
import { MatchFeedScreen, Match } from './src/screens/MatchFeedScreen';
import { colors } from './src/theme';

type AppScreen = 'splash' | 'welcome' | 'auth' | 'onboarding' | 'feed' | 'match_detail';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => setScreen('welcome')} />;

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
            onComplete={(profile) => {
              setUserProfile(profile);
              setScreen('feed');
            }}
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
        // Coming next
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{selectedMatch?.name}</Text>
            <Text style={styles.placeholderSub}>Match detail — coming next</Text>
          </View>
        );
    }
  };

  return <>{renderScreen()}</>;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.8,
  },
  placeholderSub: {
    fontSize: 15,
    color: colors.gray400,
  },
});
