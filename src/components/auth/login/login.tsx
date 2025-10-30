"use client";

import ImageWithBasePath from "@/core/imageWithBasePath";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getSupabaseClient from "@/lib/supabaseClient";
type PasswordField = "password" | "confirmPassword";

const LoginComponent = () => {
  const router = useRouter();
  // Magic link handling effect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    if (hash.includes("access_token=")) {
      try {
        window.location.replace(`/set-password${hash}`);
        return;
      } catch (e) {
        router.replace(`/set-password${hash}`);
      }
    }
  }, [router]);

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For success feedback
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false); // <-- New state

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // --- New Function: Handle Forgot Password ---
  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMessage(null); // Clear previous success messages
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      // Get the current base URL for the redirect
      const redirectTo = `${window.location.origin}/set-password`; // Redirect to your set password page

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (resetError) throw resetError;
      setSuccessMessage("Password reset instructions sent to your email. Please check your inbox (and spam folder).");
      // Optionally switch back to login mode after success
      // setIsForgotPasswordMode(false);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email. Please try again.");
      console.error("Forgot Password Error:", err);
    } finally {
      setLoading(false);
    }
  };
  // --- End New Function ---

  const handleLogin = async () => {
    setError(null);
    setSuccessMessage(null); // Clear previous messages
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Persist user_type AND name (localStorage)
      try {
        const authUser = (data as any)?.user ?? null;
        const userId = authUser?.id ?? null;
        let detectedUserType = authUser?.user_metadata?.user_type ?? null;
        let detectedUserName = authUser?.user_metadata?.name ?? null;

        if (!detectedUserType && userId) {
          try {
            const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', userId).maybeSingle();
            if (profile) {
              if (profile.user_type) detectedUserType = profile.user_type;
              try { localStorage.setItem('profile', JSON.stringify(profile)); } catch (_) { }
            }
          } catch (pfErr) { /* ignore */ }
        }

        if (detectedUserType) {
          try { localStorage.setItem('user_type', detectedUserType); } catch (_) { }
        } else {
          console.warn("Could not determine user_type after login.");
          // Defaulting to admin as per previous logic if needed
          try { localStorage.setItem('user_type', 'Admin'); } catch (_) { }
        }

        if (detectedUserName) {
          try { localStorage.setItem('user_name', detectedUserName); } catch (_) { }
        }

      } catch (persistErr) {
        console.debug('[login] failed to persist user data', persistErr);
      }

      router.push(all_routes.dashboard);
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Start Content */}
      <div className="auth-bg position-relative overflow-hidden">
        <div className="container-fuild position-relative z-1">
          <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
            {/* start row */}
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap py-3">
              <div className="col-lg-4 mx-auto">
                {/* Use onSubmit for form semantics, prevent default handled by button type="button" */}
                <form
                  className="d-flex justify-content-center align-items-center"
                  onSubmit={(e) => e.preventDefault()} // Prevent default form submission
                >
                  <div className="d-flex flex-column justify-content-lg-center p-4 p-lg-0 pb-0 flex-fill">
                    <div className="card border-1 p-lg-3 shadow-md rounded-3 mb-4">
                      <div className="card-body">
                        <div className="text-center mb-3">
                          <div className=" mx-auto mb-4 text-center">
                            <ImageWithBasePath
                              src="assets/img/om_logo-rem.png"
                              className="img-fluid"
                              alt="Logo"
                            />
                          </div>
                          {/* --- Title Changes Based on Mode --- */}
                          <h4 className="fw-bold mb-1">
                            {isForgotPasswordMode ? "Reset Password" : "Welcome Back!"}
                          </h4>
                          <p className="text-muted fs-14">
                            {isForgotPasswordMode ? "Enter your email to receive reset instructions." : "Login to your account"}
                          </p>
                          {/* --- End Title Changes --- */}
                        </div>

                        {/* --- Email Input (Always Visible) --- */}
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <div className="input-group">
                            <span className="input-group-text border-end-0 bg-white">
                              <i className="ti ti-mail fs-14 text-dark" />
                            </span>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="form-control border-start-0 ps-0"
                              placeholder="you@example.com"
                              required // Add required attribute
                            />
                          </div>
                        </div>

                        {/* --- Password Input (Conditional) --- */}
                        {!isForgotPasswordMode && ( // <-- Show only if NOT in forgot password mode
                          <div className="mb-3">
                            <label className="form-label">Password</label>
                            <div className="position-relative">
                              <div className="pass-group input-group position-relative border rounded">
                                <span className="input-group-text bg-white border-0">
                                  <i className="ti ti-lock text-dark fs-14" />
                                </span>
                                <input
                                  type={
                                    passwordVisibility.password
                                      ? "text"
                                      : "password"
                                  }
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="pass-input form-control border-start-0 ps-0"
                                  placeholder="****************"
                                />
                                <span
                                  className={`ti toggle-password text-dark fs-14 ${passwordVisibility.password
                                    ? "ti-eye"
                                    : "ti-eye-off"
                                    }`}
                                  style={{ cursor: 'pointer' }} // Add cursor pointer
                                  onClick={() =>
                                    togglePasswordVisibility("password")
                                  }
                                ></span>
                              </div>
                            </div>
                            {/* --- Forgot Password Link --- */}
                            <div className="text-end mt-1">
                              <Link
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsForgotPasswordMode(true);
                                  setError(null); // Clear login errors when switching mode
                                  setSuccessMessage(null);
                                }}
                                className="text-primary text-decoration-underline fs-13" // Adjusted style
                              >
                                Forgot Password?
                              </Link>
                            </div>
                            {/* --- End Forgot Password Link --- */}
                          </div>
                        )}

                        {/* --- Error & Success Messages --- */}
                        {error && (
                          <div className="alert alert-danger py-2">{error}</div>
                        )}
                        {successMessage && (
                          <div className="alert alert-success py-2">{successMessage}</div>
                        )}

                        {/* --- Action Button (Conditional) --- */}
                        <div className="mb-2">
                          <button
                            type="button" // Use type="button" to prevent default form submission
                            disabled={loading}
                            onClick={isForgotPasswordMode ? handleForgotPassword : handleLogin} // <-- Call correct function based on mode
                            className="btn bg-primary text-white w-100"
                          >
                            {loading ? "Processing..." : (isForgotPasswordMode ? "Send Reset Link" : "Login")} {/* <-- Button text changes */}
                          </button>
                        </div>

                        {/* --- Link to Switch Back to Login --- */}
                        {isForgotPasswordMode && (
                          <div className="text-center mt-3">
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsForgotPasswordMode(false);
                                setError(null); // Clear forgot password errors
                                setSuccessMessage(null);
                              }}
                              className="text-muted text-decoration-underline fs-13"
                            >
                              Back to Login
                            </Link>
                          </div>
                        )}

                      </div> {/* end card body */}
                    </div> {/* end card */}
                  </div>
                </form>
                <p className="text-dark text-center">
                  Copyright © 2025 - EMR
                </p>
              </div> {/* end col */}
            </div> {/* end row */}
          </div>
        </div>
      </div>
      {/* End Content */}
      <ImageWithBasePath
        src="assets/chartxbg2.jpg"
        alt="background"
        className="login-bg-cover img-fluid"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
    </>
  );
};

export default LoginComponent;