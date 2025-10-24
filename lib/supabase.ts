import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables at module load time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton supabase client lazily
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '⚠️  Missing Supabase Configuration\n\n' +
      'Please set up Supabase to use this app:\n' +
      '1. Create a free account at https://supabase.com\n' +
      '2. Create a new project\n' +
      '3. Run the SQL schema from /supabase/schema.sql\n' +
      '4. Create .env.local with your credentials\n\n' +
      'See SUPABASE_SETUP.md for detailed instructions.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Export a getter that lazily creates the client
// This prevents the app from crashing at module load time
function getSupabase(): SupabaseClient {
  return createSupabaseClient();
}

// Create a Proxy that behaves like the Supabase client but initializes lazily
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
