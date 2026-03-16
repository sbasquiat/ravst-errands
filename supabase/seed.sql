-- ============================================
-- Ravst Errands — Seed Data (Development Only)
-- ============================================
-- Run this after migrations to populate test data.
-- DO NOT run in production.
-- ============================================

-- Note: Profiles are auto-created by the handle_new_user() trigger
-- when users sign up via Supabase Auth. To seed test users,
-- create them through the Supabase dashboard or Auth API first,
-- then update their profiles here.

-- Example: After creating test users via Supabase Auth, update roles:
--
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@ravst.com';
-- UPDATE profiles SET role = 'runner' WHERE email = 'runner@ravst.com';
--
-- INSERT INTO runner_profiles (id, status, transport_mode, availability_zones, is_available, verified)
-- SELECT id, 'active', 'bicycle', ARRAY['dublin-city-centre', 'dublin-north'], true, true
-- FROM profiles WHERE email = 'runner@ravst.com';
