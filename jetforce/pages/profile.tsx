import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { withAuthAxios } from "../services/config";

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const res = await withAuthAxios().put("/auth/update-profile", {
        name,
        phone,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setSaving(true);

    try {
      const res = await withAuthAxios().put("/auth/update-profile", {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update password",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile | DriveElite</title>
        <meta name="description" content="Manage your DriveElite profile and account settings." />
      </Head>

      <div className="profile-page">
        <div className="profile-container">
          {/* User Avatar Section */}
          <div className="profile-hero">
            <div className="profile-avatar">
              <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-role-badge">
              {user?.role === "admin" ? "⚙ Administrator" : "👤 Member"}
            </div>
          </div>

          {/* Quick Links */}
          <div className="profile-quick-links">
            <Link href="/bookings" className="quick-link">
              <span className="quick-link-icon">📋</span>
              <span>My Bookings</span>
            </Link>
            <Link href="/booking" className="quick-link">
              <span className="quick-link-icon">🚗</span>
              <span>Book a Ride</span>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="quick-link">
                <span className="quick-link-icon">⚙</span>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => { setActiveTab("profile"); setMessage({ type: "", text: "" }); }}
            >
              Profile Info
            </button>
            <button
              className={`profile-tab ${activeTab === "security" ? "active" : ""}`}
              onClick={() => { setActiveTab("security"); setMessage({ type: "", text: "" }); }}
            >
              Security
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`profile-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="disabled"
                />
                <small>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form className="profile-form" onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                />
              </div>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {/* Logout */}
          <div className="profile-logout-section">
            <button
              className="profile-logout-btn"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
