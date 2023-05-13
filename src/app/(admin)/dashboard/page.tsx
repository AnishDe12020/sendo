import CreateLinkDialog from "@/components/CreateLinkDialog";
import { prisma } from "@/lib/db";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import LinkCard from "@/components/LinkCard";
import LinksTable from "@/components/LinksTable";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions as any);

  const links = await prisma.link.findMany({
    where: {
      createdBy: {
        address: (session as any)?.user?.name,
      },
    },
  });

  return (
    <div className="flex flex-col items-center w-full mt-8">
      <CreateLinkDialog />

      <LinksTable links={links} />
    </div>
  );
};

export default DashboardPage;
