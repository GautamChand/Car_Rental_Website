// pages/api/calculate.js

import { calculatePrice } from '../../server/controllers/calculateDistanceController';
import dbConnect from '../../utils/db.connect';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Ensure database connection is established (if needed)
    await dbConnect();

    // Call the existing controller function.
    // (Your controller is already using req.body, res, etc.)
    return await calculatePrice(req, res);
  } catch (error) {
    console.error('Error in API /calculate route:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
