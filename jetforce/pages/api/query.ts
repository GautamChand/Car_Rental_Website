import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../utils/db.connect";
import Query from "../../server/models/queryModel";
import {queryEmail} from "../../server/utils/queryEmail"
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
 
  try {
    await dbConnect();
 
    const { name, email, phone, message } = req.body;
 
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const newQuery = new Query({ name, email, phone, message });
    await newQuery.save();
    try {
      await queryEmail({
        toEmail: email,
        toName: name,
        params: {
          NAME: name,
          MESSAGE: message,
          projectName:'DriveElite'

        },
      });
      return res.status(201).json({ success: true, data: newQuery, emailSent: true });
    } catch (emailError: any) {
      console.error("Brevo email error:", emailError);
      return res.status(201).json({
        success: true,
        data: newQuery,
        emailSent: false,
        emailError: emailError.message,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}