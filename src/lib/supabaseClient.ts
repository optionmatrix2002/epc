"use client";

// Lightweight Supabase client wrapper for Next.js (app router)
// Reads credentials from environment variables. Do NOT commit real keys.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (supabase) return supabase;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error(
            "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        );
    }

    supabase = createClient(url, anonKey, {
        auth: {
            // Let Supabase manage session in the browser
            persistSession: true,
            detectSessionInUrl: true,
        },
    });

    return supabase;
}

export async function signOut() {
    const sb = getSupabaseClient();
    await sb.auth.signOut();
}

export default getSupabaseClient;
