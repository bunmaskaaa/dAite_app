import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signInWithOTP = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      channel: 'email' as any,
    },
  });
  return { error };
};

export const verifyOTP = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const upsertProfile = async (profile: Partial<{
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  orientation: string;
  age_range_min: number;
  age_range_max: number;
  match_philosophy: string;
  looking_for: string;
  personality_snapshot: string;
  partner_values: string;
  dealbreaker: string;
  onboarding_complete: boolean;
}>) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
};

export const sendIntroduction = async (
  receiverId: string,
  compatibilityScore: number,
  matchReason: string
) => {
  const user = await getCurrentUser();
  if (!user) return { error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('introductions')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      compatibility_score: compatibilityScore,
      match_reason: matchReason,
    })
    .select()
    .single();
  return { data, error };
};
