require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = 'jared+0010@makefriendly.co.za'
const name = 'Jared Buckley'

async function updateUserName() {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      throw listError
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }
    
    console.log(`✅ Found user: ${user.id}`)
    console.log(`   Current metadata:`, user.user_metadata)
    
    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          name: name,
          full_name: name
        }
      }
    )
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError)
      throw updateError
    }
    
    console.log('✅ User updated successfully!')
    console.log(`   Name: ${updatedUser.user.user_metadata.name}`)
    console.log(`   Full Name: ${updatedUser.user.user_metadata.full_name}`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

updateUserName()

