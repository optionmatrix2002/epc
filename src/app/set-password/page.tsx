"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import getSupabaseClient from "@/lib/supabaseClient";
import { all_routes } from "@/routes/all_routes";
import ImageWithBasePath from "@/core/imageWithBasePath";

export default function SetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [userEmail, setUserEmail] = useState<string | null>(null); // <-- Store user's email
    const [loading, setLoading] = useState(false); // For OTP send
    const [isSaving, setIsSaving] = useState(false); // For final save
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [strength, setStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false); // Track if session check is done

    // Fetch user email once session is potentially established
    const fetchUserEmail = useCallback(async () => {
        const supabase = getSupabaseClient();
        try {
            // Wait briefly for client to initialize session from hash
            await new Promise(resolve => setTimeout(resolve, 200));
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                console.error("Error fetching user on mount:", userError);
                setError("Could not verify your session. Please try the link again.");
                return;
            }
            if (user?.email) {
                setUserEmail(user.email);
                console.log("User email found:", user.email);
                // Session is valid, clear hash if present
                if (window.location.hash.includes('access_token=')) {
                    try { window.history.replaceState({}, document.title, window.location.pathname + window.location.search); } catch (e) { }
                }
            } else {
                console.warn("No user email found in session.");
                setError("Invalid session or link expired. Please request a new password reset.");
                // Optionally redirect after a delay
                // setTimeout(() => router.push(all_routes.login), 3000);
            }
        } catch (err: any) {
            console.error("Error in fetchUserEmail:", err);
            setError("An error occurred verifying your session.");
        } finally {
            setSessionChecked(true); // Mark session check as complete
        }
    }, [router]);

    useEffect(() => {
        // Only run fetchUserEmail once on mount
        if (!sessionChecked) {
            fetchUserEmail();
        }
    }, [fetchUserEmail, sessionChecked]); // Depend on the callback

    // --- Request OTP ---
    const handleRequestOtp = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!userEmail) {
            setError("Cannot identify user. Please try the reset link again.");
            setLoading(false);
            return;
        }
        if (!password) {
            setError("Please enter a new password first.");
            setLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        // Basic strength check (optional)
        if (strength < 2) {
            setError("Password is too weak.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/send-password-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }), // Send email to API
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send OTP.');

            setSuccessMessage(data.message || 'Verification code sent.');
            setOtpSent(true);
        } catch (err: any) {
            setError(err.message || "Failed to send verification code.");
            console.error("Request OTP Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Verify OTP and Update Password ---
    const handleVerifyOtpAndUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        if (!userEmail) { // Should not happen if UI logic is correct, but safe check
            setError("User session lost. Please try again.");
            setIsSaving(false);
            return;
        }
        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit verification code.");
            setIsSaving(false);
            return;
        }

        try {
            // 1. Verify OTP via API route
            const verifyResponse = await fetch('/api/verify-password-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, otp }), // Send email and OTP
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.verified) {
                throw new Error(verifyData.error || 'Invalid or expired verification code.');
            }

            // 2. If OTP is verified, update the password client-side
            const supabase = getSupabaseClient();
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                console.error("Password Update Error after OTP:", updateError);
                throw new Error(updateError.message || "Failed to update password after verification.");
            }

            // On success
            setSuccessMessage("Password successfully updated!");
            setTimeout(() => {
                router.push(all_routes.login);
            }, 1500);

        } catch (err: any) {
            setError(err.message || "An error occurred during verification or saving.");
            console.error("Verify/Update Password Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Password strength calculation
    useEffect(() => { /* ... (keep existing logic) ... */
        let score = 0;
        if (!password) { setStrength(0); return; } // Reset if empty
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Includes symbols
        setStrength(score > 4 ? 4 : score); // Cap score at 4
    }, [password]);

    // Helper to hide modals
    const hideAllModals = () => { /* ... (keep existing logic) ... */ };

    // Render loading state while checking session
    if (!sessionChecked) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="auth-bg position-relative overflow-hidden">
                {/* ... (Container and Row structure remains the same) ... */}
                <div className="container-fuild position-relative z-1">
                    <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
                        <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap py-3">
                            <div className="col-lg-4 mx-auto">
                                <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                                    <div className="card-body">
                                        <h4 className="card-title mb-1">Set Your Password</h4>
                                        <p className="text-muted fs-14 mb-3">
                                            {otpSent ? "Enter the code sent to your email." : "Create and confirm your new password."}
                                        </p>
                                        <form onSubmit={otpSent ? handleVerifyOtpAndUpdatePassword : (e) => e.preventDefault()}>
                                            {/* Password Fields (Show before OTP sent) */}
                                            {!otpSent && (
                                                <>
                                                    <div className="mb-3">
                                                        <label className="form-label">New password</label>
                                                        <div className="input-group">
                                                            <input className="form-control" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
                                                            <button type="button" className="btn btn-light border" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">
                                                                <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Confirm password</label>
                                                        <div className="input-group">
                                                            <input className="form-control" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} required />
                                                            <button type="button" className="btn btn-light border" onClick={() => setShowConfirmPassword(s => !s)} aria-label="Toggle confirm password visibility">
                                                                <i className={showConfirmPassword ? 'ti ti-eye-off' : 'ti ti-eye'} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Strength</label>
                                                        <div className="progress" style={{ height: 8 }}>
                                                            <div className={`progress-bar ${strength <= 1 ? 'bg-danger' : strength === 2 ? 'bg-warning' : strength >= 3 ? 'bg-success' : ''}`} role="progressbar" style={{ width: `${(strength / 4) * 100}%` }} aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4}></div>
                                                        </div>
                                                        <small className="text-muted">{strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength >= 3 ? 'Good' : ''}</small>
                                                    </div>
                                                </>
                                            )}

                                            {/* OTP Input Field (Show after OTP sent) */}
                                            {otpSent && (
                                                <div className="mb-3">
                                                    <label className="form-label">Verification Code</label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="\d{6}" // Basic pattern for 6 digits
                                                        maxLength={6}
                                                        className="form-control"
                                                        value={otp}
                                                        onChange={e => setOtp(e.target.value)}
                                                        placeholder="Enter 6-digit code"
                                                        required
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            )}

                                            {/* Error & Success Messages */}
                                            {error && <div className="alert alert-danger py-2">{error}</div>}
                                            {successMessage && <div className="alert alert-success py-2">{successMessage}</div>}

                                            {/* Action Buttons */}
                                            <div className="d-flex justify-content-end gap-2 mt-3">
                                                <button className="btn btn-secondary" type="button" onClick={() => router.push(all_routes.login)}>Cancel</button>
                                                {!otpSent ? (
                                                    <button className="btn btn-primary" type="button" disabled={loading || !userEmail} onClick={handleRequestOtp}>
                                                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-primary" type="submit" disabled={isSaving}>
                                                        {isSaving ? 'Verifying & Saving...' : 'Verify & Save Password'}
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <p className="text-dark text-center">Copyright © 2025 - EMR</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Background Image */}
            <ImageWithBasePath src="assets/chartxbg2.jpg" alt="background" className="login-bg-cover img-fluid" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
        </>
    );
}