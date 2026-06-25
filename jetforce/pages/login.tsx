import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query.redirect as string;
      if (redirect) {
        router.push(redirect);
      } else if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | DriveElite Car Rental</title>
        <meta name="description" content="Login to your DriveElite account to book rides and manage your bookings." />
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
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-input-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-link">
            Don&apos;t have an account?{" "}
            <Link href="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Hide header and footer on login page
LoginPage.noHeader = true;
LoginPage.noFooter = true;

export default LoginPage;
