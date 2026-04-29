
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://htiuiokyxkatijcpczhe.supabase.co"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXVpb2t5eGthdGlqY3BjemhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ2OTMxMywiZXhwIjoyMDkzMDQ1MzEzfQ.3WnU9dCFwcm_NNOlXUdIzghaJJHPa4eDtbXvlC1uXP4"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkLeads() {
  const { data: leads, error } = await supabase.from('leads').select('*')
  if (error) {
    console.error('Erro ao buscar leads:', error.message)
  } else {
    console.log(`Leads encontrados: ${leads.length}`)
    leads.forEach(l => console.log(`- ${l.nome} (${l.status}) | Criado em: ${l.created_at}`))
  }
}

checkLeads()
