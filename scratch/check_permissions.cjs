
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://htiuiokyxkatijcpczhe.supabase.co"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXVpb2t5eGthdGlqY3BjemhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ2OTMxMywiZXhwIjoyMDkzMDQ1MzEzfQ.3WnU9dCFwcm_NNOlXUdIzghaJJHPa4eDtbXvlC1uXP4"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkPermissions() {
  console.log('--- Verificando Usuarios Auth ---')
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) console.error('Erro Auth:', authError.message)
  else {
    users.forEach(u => console.log(`ID: ${u.id} | Email: ${u.email}`))
  }

  console.log('\n--- Verificando Tabela user_roles ---')
  const { data: roles, error: roleError } = await supabase.from('user_roles').select('*')
  if (roleError) console.error('Erro Roles:', roleError.message)
  else {
    console.log('Roles encontradas:', roles.length)
    roles.forEach(r => console.log(`User ID: ${r.user_id} | Role: ${r.role}`))
  }
}

checkPermissions()
