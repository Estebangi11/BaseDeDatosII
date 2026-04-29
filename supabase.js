// ================================================================
//  supabase.js — Conexión con Supabase
//  Reemplaza TU_URL y TU_KEY con tus datos reales de:
//  Supabase → Settings → API Keys
// ================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://zcuhnwbwqziinlvjmdtz.supabase.co'  // <-- tu URL real
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdWhud2J3cXppaW5sdmptZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Nzc1NDEsImV4cCI6MjA5MjQ1MzU0MX0.wHrb8jE0QLMhXdQbvVEky9iY3pMgM7bWWBMUWy5XPAM'              // <-- tu publishable key COMPLETA

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)