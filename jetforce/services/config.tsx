import axios from "axios";

// Base URL - use relative path so Next.js API routes are used directly
const BASE_URL = "/api";

/**
 * Axios instance WITHOUT auth token (for public endpoints)
 */
export const withoutAuthAxios = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Axios instance WITH auth token (for protected endpoints)
 * Reads token from localStorage
 */
export const withAuthAxios = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("driveelite_token")
      : null;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
