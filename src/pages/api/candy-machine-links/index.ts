import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/db";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const session = await getServerSession(req, res, authOptions as any);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { user } = session as any;

  switch (method) {
    case "POST": {
      const { body } = req;

      if (!body) {
        return res.status(400).json({
          success: false,
          message: "No body provided",
        });
      }

      const { address, candymachineAddress, message } = body;

      if (!user.name === address) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!candymachineAddress) {
        return res.status(400).json({
          success: false,
          message: "Missing fields",
        });
      }

      try {
        const existingLink = await prisma.candyMachineLink.findFirst({
          where: {
            candymachineAddress,
          },
        });

        if (existingLink) {
          return res.status(400).json({
            success: false,
            message: "Link already exists",
          });
        }

        const link = await prisma.candyMachineLink.create({
          data: {
            candymachineAddress,
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
      } catch (error) {
        console.error(error);
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
