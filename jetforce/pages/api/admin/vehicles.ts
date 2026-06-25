import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../utils/db.connect";
import Vehicle from "../../../server/models/vehicleModel";
import jwt from "jsonwebtoken";

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
      const vehicles = await Vehicle.find();
      return res.status(200).json({ success: true, data: vehicles });
    } catch (error: any) {
      return res.status(500).json({ message: "Error fetching vehicles", error: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const { type, price_per_km, price_per_hour } = req.body;
      if (!type || !price_per_km || !price_per_hour) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newVehicle = new Vehicle({ type, price_per_km, price_per_hour });
      await newVehicle.save();

      return res.status(201).json({ success: true, data: newVehicle });
    } catch (error: any) {
      return res.status(500).json({ message: "Error adding vehicle", error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { vehicleId, type, price_per_km, price_per_hour } = req.body;
      if (!vehicleId) {
        return res.status(400).json({ message: "Vehicle ID is required" });
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        { type, price_per_km, price_per_hour },
        { new: true }
      );

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      return res.status(200).json({ success: true, data: vehicle });
    } catch (error: any) {
      return res.status(500).json({ message: "Error updating vehicle", error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { vehicleId } = req.body;
      if (!vehicleId) {
        return res.status(400).json({ message: "Vehicle ID is required" });
      }

      const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      return res.status(200).json({ success: true, message: "Vehicle deleted" });
    } catch (error: any) {
      return res.status(500).json({ message: "Error deleting vehicle", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
