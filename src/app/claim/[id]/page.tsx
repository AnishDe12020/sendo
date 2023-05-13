import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { SUPPORTED_SPL_TOKENS, TOKEN_SOL } from "@/lib/tokens";
import { WalletIcon } from "lucide-react";

interface ClaimPageProps {
  params: {
    id: string;
  };
}

const ClaimPage = async ({ params }: ClaimPageProps) => {
  const link = await prisma.link.findUnique({
    where: {
      id: params.id,
    },
  });

  console.log(link);

  return link && !link.claimed ? (
    <>
      <img
        src={
          link.token === "SOL"
            ? TOKEN_SOL.logoURI
            : SUPPORTED_SPL_TOKENS[
                link.symbol as keyof typeof SUPPORTED_SPL_TOKENS
              ].logoURI
        }
        alt={link.token === "SOL" ? "SOL" : (link.symbol as string)}
        className="w-32 h-32 rounded-lg"
      />

      <h1 className="mt-6 text-5xl font-bold">
        Claim {link.amount} {link.token === "SOL" ? "SOL" : link.symbol}
      </h1>

      {link.message && (
        <p className="mt-4 text-xl text-center text-muted-foreground">
          {link.message}
        </p>
      )}

      <div className="flex flex-col max-w-xl gap-4 p-4 mt-8 bg-secondary rounded-xl">
        <Button>
          <Icons.google className="w-10 h-10 mr-1" />
          <span>Login with Google and claim</span>
        </Button>
        <p className="text-xs">
          Ideal for new users who directly want to claim the assets
        </p>

        <div className="flex flex-row items-center justify-center gap-4">
          <div className="w-1/2 h-px bg-gray-300"></div>
          <p className="text-xs text-gray-300">or</p>
          <div className="w-1/2 h-px bg-gray-300"></div>
        </div>

        <Button>
          <WalletIcon className="w-6 h-6 mr-2" />
          <span>Connect wallet and claim</span>
        </Button>
        <p className="text-xs">
          Ideal for users who already have a wallet and want to claim the assets
        </p>
      </div>
    </>
  ) : (
    <h1 className="text-5xl font-bold">Link already claimed</h1>
  );
};

export default ClaimPage;
