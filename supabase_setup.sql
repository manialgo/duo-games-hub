-- Copy and paste this into the Supabase SQL Editor

-- 1. Create Profiles table (Tracks streaks and username)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  current_streak INT DEFAULT 0,
  highest_streak INT DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Leaderboards table (Tracks high scores for multiple games)
CREATE TABLE leaderboards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL, -- e.g., 'tilt-tower', 'neon-pong'
  high_score INT DEFAULT 0,
  level_reached INT DEFAULT 0,
  UNIQUE(user_id, game_id) -- Only one record per user per game
);

-- 3. Set up Row Level Security (RLS) so users can only edit their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles and leaderboards (for showing high scores)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Public leaderboards are viewable by everyone." ON leaderboards FOR SELECT USING (true);

-- Allow users to insert/update their own data
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own leaderboards." ON leaderboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leaderboards." ON leaderboards FOR UPDATE USING (auth.uid() = user_id);

-- 4. Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
