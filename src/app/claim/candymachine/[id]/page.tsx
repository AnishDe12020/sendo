import ClaimLinkCard from "@/components/ClaimLinkCard";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface ClaimPageProps {
  params: {
    id: string;
  };
}

const CandymachineClaimPage = async ({ params }: ClaimPageProps) => {
  const candymachineLink = await prisma.candyMachineLink.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!candymachineLink) {
    notFound();
  }

  const claimsAvailable =
    candymachineLink.size - candymachineLink.alreadyMinted;

  return (
    <>
      <img
        src={candymachineLink.imageUrl}
        alt={candymachineLink.name}
        className="w-48 h-48 rounded-xl"
      />

      <h1 className="mt-6 text-5xl font-bold">{candymachineLink.name}</h1>

      {candymachineLink.description && (
        <p className="mt-4 text-xl text-center text-muted-foreground">
          {candymachineLink.description}
        </p>
      )}

      {candymachineLink.message && (
        <p className="mt-4 text-xl text-center text-muted-foreground">
          {candymachineLink.message}
        </p>
      )}

      {candymachineLink.royalty && (
        <p className="mt-4 text-xl text-center text-muted-foreground">
          {candymachineLink.royalty}% royalty
        </p>
      )}

      {candymachineLink.symbol && (
        <p className="mt-4 text-xl text-center text-muted-foreground">
          {candymachineLink.symbol}
        </p>
      )}

      {claimsAvailable > 0 ? (
        <ClaimLinkCard id={candymachineLink.id} claimType="candy-machine" />
      ) : (
        <h1 className="text-5xl font-bold">Whole supply claimed!</h1>
      )}
    </>
  );
};

export default CandymachineClaimPage;
