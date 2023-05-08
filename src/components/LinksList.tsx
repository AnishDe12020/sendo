import { prisma } from "@/lib/db";
import LinkCard from "./LinkCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const LinksList = async () => {
  const session = await getServerSession(authOptions as any);

  const links = await prisma.link.findMany({
    where: {
      createdBy: {
        address: (session as any)?.user?.name,
      },
    },
  });

  return (
    <div className="flex flex-col items-center w-2/3 gap-6 my-12">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
};

export default LinksList;
