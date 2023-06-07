import CreateLinkDialog from "@/components/CreateLinkDialog";
import { prisma } from "@/lib/db";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import TokenLinksTable from "@/components/TokenLinksTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CandyMachineLinksTable from "@/components/CandyMachineLinksTable";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions as any);

  const links = await prisma.link.findMany({
    where: {
      createdBy: {
        address: (session as any)?.user?.name,
      },
    },
  });

  const candymachineLinks = await prisma.candyMachineLink.findMany({
    where: {
      createdBy: {
        address: (session as any)?.user?.name,
      },
    },
  });

  console.log(candymachineLinks);

  return (
    <div className="flex flex-col items-center w-full mt-8">
      <CreateLinkDialog />

      <Tabs
        defaultValue="token"
        className="flex flex-col items-center w-full mt-8"
      >
        <TabsList className="w-full my-4 md:w-2/3">
          <TabsTrigger value="token">Token</TabsTrigger>
          <TabsTrigger value="nft">NFT</TabsTrigger>
        </TabsList>
        <TabsContent value="token">
          <TokenLinksTable links={links} />
        </TabsContent>
        <TabsContent value="nft">
          <CandyMachineLinksTable candyMachineLinks={candymachineLinks} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
