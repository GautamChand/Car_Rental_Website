
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenuOnLinkClick = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass = `block font-medium transition ease-in-out duration-150 ${
    isScrolled ? "text-black hover:text-[#000000]" : "text-white hover:text-[#000000]"
  }`;

  const buttonClass = `block lg:inline-block text-center text-[22px] font-outfit font-medium rounded-[30px] px-7 py-1.5 transition-all duration-300 ${
    isScrolled ? "bg-gradient text-white hover:bg-gray-100" : "bg-gradient text-white hover:bg-gray-100"
  }`;


  return (
    <nav
      className={`fixed top-0 left-0 w-full z-30 transition-all duration-500 ${
        isScrolled ? "backdrop-blur-md shadow-lg bg-white/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center lg:px-9 px-2 mt-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-1 no-underline"
          >
            <span className="text-2xl lg:text-3xl font-bold tracking-tight" style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #f0d06e 40%, #d4a843 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.5px',
            }}>
              DriveElite
            </span>
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={toggleMenu}
            className={`block lg:hidden ${
              isScrolled ? "text-black" : "text-white"
            } focus:outline-none z-50`}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
          >
            <div
              className={`space-y-1 toggle--menu ${
                isOpen ? "active-toggle" : ""
              }`}
            >
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
              <div className="w-6 h-0.5 bg-current"></div>
            </div>
          </button>

          {/* Desktop / Mobile Links */}
          <div
            className={`main--menu--navigation ${
              isOpen
                ? "mt-12 translate-y-0 border-y border-y-[#4e4e4e] opacity-100 bg-black/50 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none"
                : "-translate-y-full opacity-0"
            } lg:translate-y-0 lg:opacity-100 lg:flex flex-col text-[20px] lg:flex-row font-outfit font-medium lg:items-center lg:space-x-8 lg:space-y-0 space-y-4 absolute lg:static top-16 left-0 w-full lg:w-auto p-4 lg:p-0 z-40 transform transition-all duration-300 ease-in-out`}
          >
            <Link href="/" className={linkClass} onClick={closeMenuOnLinkClick}>
              Home
            </Link>
            <Link
              href="/#services-section"
              className={linkClass}
              onClick={closeMenuOnLinkClick}
            >
              Services
            </Link>
            <Link
              href="/#contact"
              className={linkClass}
              onClick={closeMenuOnLinkClick}
            >
              Contact
            </Link>
            <Link
              href="/booking"
              className={buttonClass}
              onClick={closeMenuOnLinkClick}
            >
              Book
            </Link>

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 cursor-pointer"
                  aria-label="User menu"
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #fdd835, #f9a825)",
                      color: "#000",
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span
                    className={`text-sm font-medium hidden lg:inline ${
                      isScrolled ? "text-black" : "text-white/80"
                    }`}
                  >
                    {user?.name?.split(" ")[0]}
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform ${showUserMenu ? "rotate-180" : ""} ${
                      isScrolled ? "text-black" : "text-white/60"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-xl z-50"
                    style={{
                      background: "rgba(20, 20, 30, 0.95)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white font-semibold text-sm">{user?.name}</p>
                      <p className="text-white/40 text-xs truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                        onClick={closeMenuOnLinkClick}
                      >
                        👤 My Profile
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                        onClick={closeMenuOnLinkClick}
                      >
                        📋 My Bookings
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm text-yellow-400/80 hover:text-yellow-400 hover:bg-white/5 transition"
                          onClick={closeMenuOnLinkClick}
                        >
                          ⚙ Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={() => {
                          logout();
                          closeMenuOnLinkClick();
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/5 transition"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`block font-medium transition ease-in-out duration-150 text-sm ${
                    isScrolled ? "text-black hover:text-[#555]" : "text-white/80 hover:text-white"
                  }`}
                  onClick={closeMenuOnLinkClick}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "20px",
                    border: isScrolled
                      ? "1px solid rgba(0,0,0,0.2)"
                      : "1px solid rgba(255,255,255,0.3)",
                    fontSize: "14px",
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300"
                  onClick={closeMenuOnLinkClick}
                  style={{
                    background: "linear-gradient(135deg, #fdd835, #f9a825)",
                    color: "#000",
                    fontSize: "14px",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
