import { createClient } from '@supabase/supabase-js'

// Provide dummy fallback values so the app doesn't crash before the user adds their own keys.
// In production, these should come from process.env (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkpneyjlayzzigdmmbso.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcG5leWpsYXl6emlnZG1tYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTYzNjMsImV4cCI6MjEwNDc3MjM2M30.28W8JsU9UvfMfbO78UKDWIuHDkF0pjzYOYf0C4YcPzk'

export const supabase = createClient(supabaseUrl, supabaseKey)
