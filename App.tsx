import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SplashScreen } from './src/screens/SplashScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen, UserProfile } from './src/screens/OnboardingScreen';
import { MatchFeedScreen, Match } from './src/screens/MatchFeedScreen';
import { MatchDetailScreen } from './src/screens/MatchDetailScreen';

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
        return (
          <MatchDetailScreen
            match={selectedMatch!}
            onBack={() => setScreen('feed')}
            onCommit={(match) => {
              // TODO: send introduction via backend
              console.log('Introduction sent for:', match.name);
            }}
          />
        );
    }
  };

  return <>{renderScreen()}</>;
}

const styles = StyleSheet.create({});
