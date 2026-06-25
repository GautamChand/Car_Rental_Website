import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, phone);

    if (!result.success) {
      setError(result.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Register | DriveElite Car Rental</title>
        <meta name="description" content="Create your DriveElite account to start booking premium car rental services." />
      </Head>

      <div className="auth-page">
        {/* Floating particles */}
        <div className="auth-particles">
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
          <div className="auth-particle"></div>
        </div>

        <div className="auth-card">
          <div className="auth-logo">
            <h1>DriveElite</h1>
          </div>

          <div className="auth-title">
            <h2>Create Account</h2>
            <p>Join us for premium car rental services</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="register-name">Full Name *</label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="register-email">Email Address *</label>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="register-phone">Phone Number</label>
              <input
                id="register-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="auth-input-row">
              <div className="auth-input-group">
                <label htmlFor="register-password">Password *</label>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-input-group">
                <label htmlFor="register-confirm">Confirm *</label>
                <input
                  id="register-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.8rem",
              }}
            >
              <input
                type="checkbox"
                id="show-pass"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ accentColor: "#fdd835" }}
              />
              <label htmlFor="show-pass" style={{ cursor: "pointer" }}>
                Show passwords
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-link">
            Already have an account?{" "}
            <Link href="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Hide header and footer on register page
RegisterPage.noHeader = true;
RegisterPage.noFooter = true;

export default RegisterPage;
