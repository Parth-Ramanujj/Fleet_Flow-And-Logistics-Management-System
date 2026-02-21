import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tydiqcnkqxvvurslcmny.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZGlxY25rcXh2dnVyc2xjbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NDkwNTksImV4cCI6MjA4NzIyNTA1OX0.OhwmxJob-f7YdrogSKYy8LZKHV7JTtZ1usAu0Zlv9lg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
    const { data, error } = await supabase.auth.signUp({
        email: 'manager@fleetflow.io',
        password: 'Password123!',
        options: {
            data: {
                full_name: 'Fleet Manager'
            }
        }
    })

    if (error) {
        console.error('Error creating user:', error.message)
    } else {
        console.log('Success! Created user:', data.user?.email)
        console.log('Password is: Password123!')
        console.log('You can now log in using these credentials.')
    }
}

createAdmin()
