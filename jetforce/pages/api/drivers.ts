import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../utils/db.connect";
import Driver from "../../server/models/driver";
 
export default async function handler(

  req: NextApiRequest,

  res: NextApiResponse

) {

  if (req.method !== "GET") {

    return res.status(405).end();

  }
 
  try {

    await dbConnect();

    const drivers = await Driver.find().sort({ createdAt: 1 });
 
    return res.status(200).json({

      success: true,

      data: drivers,

    });

  } catch (error) {

    return res.status(500).json({ success: false });

  }

}

 

 