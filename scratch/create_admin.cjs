
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://htiuiokyxkatijcpczhe.supabase.co"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXVpb2t5eGthdGlqY3BjemhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzQ2OTMxMywiZXhwIjoyMDkzMDQ1MzEzfQ.3WnU9dCFwcm_NNOlXUdIzghaJJHPa4eDtbXvlC1uXP4"

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createAdmin() {
  const email = 'admin@suelen.com'
  const password = 'admin'
  
  console.log(`Tentando criar usuario: ${email}...`)
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  let userId;
  if (authError) {
    console.log('Erro ou usuario ja existe:', authError.message)
    const { data: users } = await supabase.auth.admin.listUsers()
    const existingUser = users.users.find(u => u.email === email)
    if (existingUser) userId = existingUser.id;
  } else {
    userId = authData.user.id;
    console.log('Usuario criado:', userId)
  }

  if (userId) {
    console.log('Tentando atribuir role na tabela user_roles...')
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: 'admin' })

    if (roleError) {
      console.error('Erro ao inserir role:', roleError.message)
    } else {
      console.log('Sucesso! Usuario admin criado e configurado.')
    }
  }
}

createAdmin()
