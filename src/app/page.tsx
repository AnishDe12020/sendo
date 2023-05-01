import CreateLinkDialog from "@/components/CreateLinkDialog";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export default async function Home() {
  const session = await getServerSession(authOptions as any);

  console.log(session);

  return (
    <div className="flex flex-col items-center w-full mt-8 space-x-4">
      <h1 className="mb-16 text-5xl font-bold">Onsol Demo</h1>

      {session ? <CreateLinkDialog /> : <ConnectWallet />}
    </div>
  );
}
