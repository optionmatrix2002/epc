// src/app/api/verify-password-otp/route.ts
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json(); // <-- Expect email and otp

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
        }

        const supabaseAdmin = getSupabaseAdmin();

        // --- FIX: Use listUsers to find the user by email ---
        const { data: listData, error: userFetchError } = await supabaseAdmin.auth.admin.listUsers({
            email: email,
        } as any); // Use 'as any' to bypass strict type check if needed

        const user = listData?.users?.[0]; // Get the first user found
        // --- END FIX ---

        if (userFetchError || !user) {
            console.error("OTP Verify Error: User not found for email:", email, userFetchError);
            return NextResponse.json({ error: 'Verification failed.' }, { status: 400 }); // Generic error
        }
        const userId = user.id;

        // 2. Fetch stored OTP
        const { data: storedOtpData, error: fetchError } = await supabaseAdmin
            .from('password_reset_otps')
            .select('otp_code, expires_at')
            .eq('user_id', userId)
            .single(); // Use single() as user_id is PK

        if (fetchError || !storedOtpData) {
            console.error("OTP Verify Error: Failed to fetch stored OTP or not found for user:", userId, fetchError);
            // Check if error is specifically 'PGRST116' (No rows found) for better error message
            const noRowError = fetchError?.code === 'PGRST116';
            return NextResponse.json({ error: noRowError ? 'No OTP request found or it has expired.' : 'Invalid or expired verification code.' }, { status: 400 });
        }

        // 3. Verify OTP and Expiry
        const now = new Date();
        const expiresAt = new Date(storedOtpData.expires_at);

        // IMPORTANT: Compare hashes in production if you stored hashes
        if (storedOtpData.otp_code !== otp || now > expiresAt) {
            console.warn(`OTP Verify Failed for user ${userId}: Code mismatch or expired.`);
            if (now > expiresAt) {
                // Clean up expired OTP
                await supabaseAdmin.from('password_reset_otps').delete().eq('user_id', userId);
            }
            return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
        }

        // 4. Delete used OTP
        await supabaseAdmin.from('password_reset_otps').delete().eq('user_id', userId);

        console.log(`OTP verified successfully for user ${userId}`);
        return NextResponse.json({ verified: true }); // Indicate success

    } catch (err: any) {
        console.error("API Error in /api/verify-password-otp:", err);
        return NextResponse.json({ error: err.message || 'Failed to verify OTP.' }, { status: 500 });
    }
}