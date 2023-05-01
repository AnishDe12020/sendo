import CreateLinkDialog from "@/components/CreateLinkDialog";
import { prisma } from "@/lib/db";
import { SUPPORTED_SPL_TOKENS, TOKEN_SOL } from "@/lib/tokens";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ClipboardCopyIcon, ClipboardIcon } from "lucide-react";
import LinkCard from "@/components/LinkCard";

export default async function Home() {
  const session = await getServerSession(authOptions as any);

  const links = await prisma.link.findMany({
    where: {
      createdBy: {
        address: (session as any)?.user?.name,
      },
    },
  });

  console.log(links);

  return (
    <div className="flex flex-col items-center w-full mt-8 space-x-4">
      <h1 className="mb-16 text-5xl font-bold">Onsol Demo</h1>

      <CreateLinkDialog />

      <div className="flex flex-col items-center w-2/3 gap-6 my-12">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  );
}
