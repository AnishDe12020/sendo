import ClaimLinkCard from "@/components/ClaimLinkCard";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import useWeb3Auth from "@/hooks/useWeb3Auth";
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

      <ClaimLinkCard link={link} />
    </>
  ) : (
    <h1 className="text-5xl font-bold">Link already claimed</h1>
  );
};

export default ClaimPage;
