import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wcxhnmfcxjnmxpgtoeup.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjeGhubWZjeGpubXhwZ3RvZXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzQ1MjcsImV4cCI6MjA5MzU1MDUyN30.3nDIpznQc2Kam3azSIIWxztph61mL9KSTwPVPS34lYg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
