import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ussrrfoyuclwtnkuwqzl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzc3JyZm95dWNsd3Rua3V3cXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzQ1MDcsImV4cCI6MjA2ODUxMDUwN30.yT99Gq_9yheqFRTuYLBfsj0A8DCSz4TmrB6cWAEiLzM'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase 