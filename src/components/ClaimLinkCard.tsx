"use client";

import { WalletIcon } from "lucide-react";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Link } from "@prisma/client";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { ConnectWallet } from "./shared/ConnectWallet";
import axios from "axios";
import { toast } from "sonner";
import Lottie from "react-lottie-player";

import claimingCircleAnimation from "../../public/claiming-circle.json";
import { useRouter } from "next/navigation";
import { sleep } from "@/lib/utils";

interface ClaimLinkCardProps {
  link: Link;
}

enum Status {
  IDLE,
  CLAIMING,
  CLAIMED_WEB3AUTH,
  CLAIMED_WALLET,
}

const ClaimLinkCard = ({ link }: ClaimLinkCardProps) => {
  const { login, address, web3auth } = useWeb3Auth();
  const { publicKey } = useWallet();

  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [claimSignature, setClaimSignature] = useState<string>("");

  const router = useRouter();

  const claim = async (claimerAddress: string) => {
    try {
      const { data } = await axios.post(`/api/links/${link.id}`, {
        claimerAddress,
      });

      if (!data.success) {
        throw new Error("Failed to claim link");
      }

      const { transferSig } = data;

      setClaimSignature(transferSig);

      return true;
    } catch (err) {
      toast.error("Failed to claim link");

      return false;
    }
  };

  const handleWeb3AuthClaim = async () => {
    setStatus(Status.CLAIMING);
    if (!address) {
      await login();
      router.refresh();
      return;
    }

    const success = await claim(address);

    if (!success) {
      setStatus(Status.IDLE);
      return;
    }

    setStatus(Status.CLAIMED_WEB3AUTH);
  };

  const handleWalletClaim = async () => {
    setStatus(Status.CLAIMING);

    if (!publicKey) {
      toast.error("Please connect a wallet");
      return;
    }

    const success = await claim(publicKey.toBase58());

    if (!success) {
      setStatus(Status.IDLE);
      return;
    }

    setStatus(Status.CLAIMED_WALLET);
  };

  return (
    <div className="flex flex-col max-w-xl gap-4 p-4 mt-8 bg-secondary rounded-xl">
      {status === Status.IDLE && (
        <>
          <Button
            onClick={handleWeb3AuthClaim}
            className="text-black bg-white hover:bg-gray-200"
            isLoading={!web3auth}
          >
            <Icons.google className="w-10 h-10 mr-1" />
            <span>
              {web3auth && address
                ? "Claim to connected Google Account Wallet"
                : "Login with Google to claim"}
            </span>
          </Button>
          <p className="text-xs">
            Ideal for new users who directly want to claim the assets
          </p>

          <div className="flex flex-row items-center justify-center gap-4">
            <div className="w-1/2 h-px bg-gray-300"></div>
            <p className="text-xs text-gray-300">or</p>
            <div className="w-1/2 h-px bg-gray-300"></div>
          </div>

          {publicKey ? (
            <Button onClick={handleWalletClaim}>
              <WalletIcon className="w-6 h-6 mr-2" />
              <span>Claim to connected Solana Wallet</span>
            </Button>
          ) : (
            <ConnectWallet onlyConnect>
              <WalletIcon className="w-6 h-6 mr-2" />
              <span>Connect Solana Wallet and Claim</span>
            </ConnectWallet>
          )}
          <p className="text-xs">
            Ideal for users who already have a wallet and want to claim the
            assets
          </p>
        </>
      )}

      {status === Status.CLAIMING && (
        <>
          <Lottie
            loop
            animationData={claimingCircleAnimation}
            play
            style={{
              width: 200,
              height: 200,
            }}
          />
          <p className="text-sm text-center">Claiming your assets...</p>
        </>
      )}

      {status === Status.CLAIMED_WEB3AUTH && (
        <>
          <p className="text-center">Claimed to your Google Account Wallet</p>

          <Button onClick={() => router.push("/wallet")}>Go to Wallet</Button>

          <Button
            onClick={() => {
              window.open(`https://solscan.io/tx/${claimSignature}`, "_blank");
            }}
            className="bg-green-700 hover:bg-green-800"
          >
            View Transaction
          </Button>
        </>
      )}

      {status === Status.CLAIMED_WALLET && (
        <>
          <p className="text-center">Claimed to your Solana Wallet</p>

          <Button
            onClick={() => {
              window.open(`https://solscan.io/tx/${claimSignature}`, "_blank");
            }}
            className="bg-green-700 hover:bg-green-800"
          >
            View Transaction
          </Button>
        </>
      )}
    </div>
  );
};

export default ClaimLinkCard;
