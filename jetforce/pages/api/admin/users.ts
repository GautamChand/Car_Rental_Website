import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/db.connect";
import User from "../../../server/models/userModel";
import jwt from "jsonwebtoken";

/**
 * GET /api/admin/users — List all users (admin only)
 * PUT /api/admin/users — Update user role (admin only)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { userId, role } = req.body;
      if (!userId || !role) {
        return res.status(400).json({ message: "User ID and role are required" });
      }

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating user", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
