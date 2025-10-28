// Server-side Supabase admin client. Import this only in server code (API routes, server actions).
import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRole) {
        throw new Error(
            "Missing server Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment."
        );
    }

    // createServerClient is safe on the server and does not expose the key to the client
    return createClient(url, serviceRole);
}

export default getSupabaseAdmin;
