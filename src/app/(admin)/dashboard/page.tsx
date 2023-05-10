import CreateLinkDialog from "@/components/CreateLinkDialog";
import { prisma } from "@/lib/db";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import LinkCard from "@/components/LinkCard";

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

      <div className="flex flex-col items-center w-2/3 gap-6 my-12 mt-12">
        {links.length > 0 ? (
          links.map((link) => <LinkCard key={link.id} link={link} />)
        ) : (
          <p className="text-xl text-center text-muted-foreground">
            You don't have any links yet. Create one by clicking on the button
            above.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
