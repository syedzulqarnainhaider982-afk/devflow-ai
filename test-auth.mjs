import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase Auth...');
  const testEmail = `test_${Date.now()}@example.com`;
  
  console.log(`Attempting to sign up ${testEmail}...`);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!'
  });
  
  if (error) {
    console.error('Signup Error:', error.message);
    return;
  }
  
  console.log('Signup Response:', {
    user: data.user?.id,
    session: data.session ? 'Session created' : 'No session (Email confirmation required)'
  });
}

testAuth();
