import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wctfdbypvdgkaaikutaa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdGZkYnlwdmRna2FhaWt1dGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MjQ0MTMsImV4cCI6MjA5MzMwMDQxM30.po1tHlkeTizTA2paxZB5pgORG46AyiWZOhHIYEqEs8A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Registration = {
  id: string
  name: string
  email: string
  whatsapp: string
  ticket_count: number
  total_amount: number
  payment_proof_url: string | null
  holder_names: string[] | null
  status: 'menunggu' | 'diterima' | 'ditolak'
  created_at: string
}

export type Ticket = {
  id: string
  registration_id: string
  barcode: string
  holder_name: string
  email: string
  used: boolean
  used_at: string | null
  created_at: string
}
