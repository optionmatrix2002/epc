Supabase integration
====================

Steps to safely add Supabase to this project:

1. Install the SDK

   In PowerShell run:

   npm install @supabase/supabase-js

2. Add credentials (locally only)

   - Copy `.env.local.example` to `.env.local` in the project root.
   - Replace the placeholders with your Supabase values. Example (DO NOT commit):

     NEXT_PUBLIC_SUPABASE_URL=https://tqmxmszyukevvdtacibd.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)

   For server-only actions (service role key), set these in your deployment environment (not in `.env.local`):
     SUPABASE_URL=https://tqmxmszyukevvdtacibd.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

3. Usage

 - Client components / browser: import `getSupabaseClient` from `src/lib/supabaseClient`.
 - Server/secure operations: import `getSupabaseAdmin` from `src/lib/supabaseAdmin` (only use in server code).

4. Security

 - Never commit `.env.local` or service keys. Keep the service-role key in your deployment secrets.
