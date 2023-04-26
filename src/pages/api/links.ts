import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST": {
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const { amount, token, depositTxSig, address, message } = body;

      if (!amount || !token || !depositTxSig || !address) {
        return res.status(400).json({
          success: false,
          message: "Missing fields",
        });
      }

      try {
        const link = await prisma.link.create({
          data: {
            amount,
            token,
            depositTx: depositTxSig,
            message,
            createdBy: {
              connect: {
                address,
              },
            },
          },
        });

        return res.status(200).json({
          success: true,
          message: "Link created",
          link,
        });
      } catch (e) {
        console.error(e);
        return res.status(500).json({
          success: false,
          message: "Failed to create link",
        });
      }
    }

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
