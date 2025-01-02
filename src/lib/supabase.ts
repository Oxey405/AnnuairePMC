import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>('https://ajpjlbxfgefxobjkbzce.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGpsYnhmZ2VmeG9iamtiemNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1OTYyOTMsImV4cCI6MjA1MTE3MjI5M30.PkUaOqO9OpRZ6W-NsEPok6TzFZeYlhEED9y602ZusGs')