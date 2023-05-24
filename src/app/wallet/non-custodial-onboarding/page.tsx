"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import { getNetWorth, getSOL, getTokens } from "@/utils/getWalletData";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export enum WalletSetupSteps {
  Welcome,
  Details,
  Downloadwallet,
  Transfer,
  Done,
}

interface TransferFormSchema {
  address: string;
}

const transferFormSchemaResolver = zodResolver(
  z
    .object({
      address: z.string().refine(
        (val) => {
          try {
            new PublicKey(val);
            return true;
          } catch (err) {
            return false;
          }
        },
        {
          message:
            "Invalid recipient address. Make sure it is a Solana public key",
        }
      ),
    })
    .required()
);

const NonCustodialOnboardingPage = () => {
  const [step, setStep] = useState(WalletSetupSteps.Welcome);
  const [isTransfering, setIsTransfering] = useState(false);

  const { address, login, web3auth, isLoadingAddress, sendTransaction } =
    useWeb3Auth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormSchema>({
    resolver: transferFormSchemaResolver,
  });

  const { connection } = useConnection();

  const { data: walletData } = useQuery({
    queryKey: ["web3auth-wallet-data"],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const solData = await getSOL(address, connection);

      const tokens = await getTokens(address, connection);

      console.log(tokens);

      const netWorth = await getNetWorth(solData?.inUSD, tokens);

      return {
        solData,
        tokens,
        netWorth,
      };
    },
    enabled: !!address,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!walletData) {
      toast.error("Something went wrong. Please try again");
      return;
    }

    setIsTransfering(true);

    const publicKey = new PublicKey(address);
    const recipient = new PublicKey(data.address);

    const { solData, tokens } = walletData;

    const tx = new Transaction();

    if (!solData?.inSOL) {
      setIsTransfering(false);
      toast.error("No SOL to cover gase fees");
      return;
    }

    if (tokens) {
      Promise.all(
        tokens.map(async (token) => {
          const userATA = getAssociatedTokenAddressSync(
            new PublicKey(token.address),
            publicKey
          );

          const recipientATA = getAssociatedTokenAddressSync(
            new PublicKey(token.address),
            recipient
          );

          try {
            const tokenAccount = await getAccount(connection, recipientATA);

            if (!tokenAccount.isInitialized) {
              const createATAIx = createAssociatedTokenAccountInstruction(
                new PublicKey(address),
                recipientATA,
                recipient,
                new PublicKey(token.address)
              );

              tx.add(createATAIx);
            }
          } catch (err) {
            const createATAIx = createAssociatedTokenAccountInstruction(
              new PublicKey(address),
              recipientATA,
              recipient,
              new PublicKey(token.address)
            );

            tx.add(createATAIx);
          }

          const transferIx = createTransferCheckedInstruction(
            userATA,
            new PublicKey(token.address),
            recipientATA,
            new PublicKey(address),
            token.balance * 10 ** token.decimals,
            token.decimals
          );

          tx.add(transferIx);
        })
      );
    }

    const latestBlockhash = await connection.getLatestBlockhash();

    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = new PublicKey(address);

    const gasRequiredTillNowLamports = await tx.getEstimatedFee(connection);

    if (!gasRequiredTillNowLamports) {
      setIsTransfering(false);
      toast.error("Something went wrong. Please try again");
      return;
    }

    const gasRequiredTillNow = gasRequiredTillNowLamports;

    const solBalance = solData.inSOL - gasRequiredTillNow / LAMPORTS_PER_SOL;

    if (solBalance < 0) {
      setIsTransfering(false);
      toast.error("Not enough SOL to cover gas fees");
      return;
    }

    console.log(
      (solData.inSOL * LAMPORTS_PER_SOL -
        gasRequiredTillNow * LAMPORTS_PER_SOL -
        0.001 * LAMPORTS_PER_SOL) /
        LAMPORTS_PER_SOL
    );

    const solTransferIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: recipient,
      lamports: (solData.inSOL - 0.001) * LAMPORTS_PER_SOL - gasRequiredTillNow,
    });

    tx.add(solTransferIx);

    const transferSig = await sendTransaction(tx, connection);

    if (!transferSig) {
      toast.error("Something went wrong");
      return;
    }

    await connection.confirmTransaction(
      {
        signature: transferSig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "processed"
    );

    toast.success("Transfer successful", {
      action: {
        label: "View Transaction",
        onClick: () => {
          window.open(
            `https://explorer.solana.com/tx/${transferSig}`,
            "_blank"
          );
        },
      },
    });

    setIsTransfering(false);

    setStep(WalletSetupSteps.Done);
  });

  return (
    <div className="flex flex-col items-center gap-4 w-[24rem] md:w-[32rem]">
      {web3auth && !isLoadingAddress ? (
        address ? (
          <div className="flex flex-col w-full gap-4 mb-6">
            {step === WalletSetupSteps.Welcome && (
              <>
                <h2 className="text-4xl font-bold">
                  Welcome to the Non-Custodial Wallet Setup
                </h2>

                <p>
                  Make sure you have ~10 minutes to complete this setup process.
                  This is the breakdown of the process:
                </p>

                <ol className="list-decimal list-inside">
                  <li>Download a non-custodial wallet</li>
                  <li>Set up the non-custodial wallet</li>
                  <li>
                    Transfer your funds from your current wallet to the
                    non-custodial wallet
                  </li>
                </ol>

                <p>
                  Once you are ready, click the button below to start the setup
                  process.
                </p>

                <p className="text-sm">
                  Note: If you have already set up a non-custodial wallet, you
                  can skip the next step and directly go to the transfer step.
                </p>

                <Button onClick={() => setStep(WalletSetupSteps.Details)}>
                  Start
                </Button>

                <Button
                  onClick={() => setStep(WalletSetupSteps.Transfer)}
                  variant="secondary"
                >
                  Skip to Transfer
                </Button>
              </>
            )}

            {step === WalletSetupSteps.Details && (
              <>
                <h2>What is a non-custodial wallet?</h2>

                <p>
                  Before you get started with a non-custodial wallet, it is
                  important to understand what the wallet you are using
                  currently is and how a non-custodial wallet is different.
                </p>

                <p>
                  The wallet you are using now by logging in with your Google
                  account is a semi-custodial wallet where the private keys are
                  stored a network called Torus. Without getting into the
                  technical details, it can be simply understood that your
                  private key is vulnerable to attacks and you do not have full
                  control over your wallet.
                </p>

                <p>
                  It is still pretty secure. In this case, for your wallet to be
                  compromised, either the Torus networks needs to be compromised
                  or the Google account you are using to login or Google itself
                  needs to be compromised. Both of these are very unlikely to
                  happen.
                </p>

                <p>
                  A non-custodial wallet is different in the sense that you hold
                  the private keys to your wallet. This means that you have full
                  control over your wallet and no one can access your wallet
                  unless you give them your private keys. Obviously this means
                  that you need to be careful with your private keys and not
                  share them with anyone. If you lose your private keys, you
                  will lose access to your wallet and your funds.
                </p>

                <p>
                  Most wallets approach this in a little different way, that is
                  instead of saving the private key, they save a mnemonic phrase
                  which can be used to generate the private key. This is easier
                  to write down somewhere or even remember. Ideally you should
                  write down your recovery phrase and store it somewhere safe.
                </p>

                <p>
                  Now that you understand the difference between a custodial and
                  non-custodial wallet, let&apos;s get started with the setup
                  process. Click on the button below to guide you through
                  downloading a wallet and setting it up.
                </p>

                <Button
                  onClick={() => setStep(WalletSetupSteps.Downloadwallet)}
                >
                  Download a wallet
                </Button>
              </>
            )}
            {step === WalletSetupSteps.Downloadwallet && (
              <>
                <h2>Download a wallet</h2>

                <p>
                  There are many wallets available in the market. We recommend
                  using the Phantom wallet. It is a browser extension wallet
                  that is easy to use and has a great user experience. You can
                  download it from the link below.
                </p>

                <a
                  href="https://phantom.app/download"
                  className="text-[#4C44C6]"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://phantom.app/download
                </a>

                <p>
                  On the download page, select the browser you are using if you
                  are on desktop (only chromium based browsers are supported).
                  If you are on mobile, follow the links to download the app
                  from the app store or the play store.
                </p>

                <p>
                  You can follow this official guide from Phantom to set up your
                  wallet:
                </p>

                <a
                  href="https://help.phantom.app/hc/en-us/articles/8071074929043-How-to-create-a-new-wallet"
                  className="text-[#4C44C6]"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://help.phantom.app/hc/en-us/articles/8071074929043-How-to-create-a-new-wallet
                </a>

                <p>
                  Essentially the process is clicking on &quot;Create a new
                  Wallet&quot;, setting up a password and then writing down the
                  recovery phrase. Make sure you write down the recovery phrase
                  somewhere safe. If you lose your recovery phrase, you will
                  lose access to your wallet and your funds.
                </p>

                <p>
                  Never share your recovery phrase with anyone.{" "}
                  <strong>
                    If anyone asks you for your recovery phrase or private key,
                    it is an immediate red flag.{" "}
                  </strong>{" "}
                  If someone gets access to your recovery phrase, they can steal
                  your funds.
                </p>

                <p className="text-sm">
                  Note: Phantom is a multi-chain wallet. This means it supports
                  Solana as well as other blockchains.
                </p>

                <p>
                  Once you have set up your wallet, click on the button below to
                  continue to the next step.
                </p>

                <Button onClick={() => setStep(WalletSetupSteps.Transfer)}>
                  Next
                </Button>
              </>
            )}

            {step === WalletSetupSteps.Transfer && (
              <>
                <h2>Transfer your funds</h2>

                <p>
                  Now that you have set up your wallet, you need to transfer
                  your funds from your current wallet to your new wallet.
                </p>

                <p>
                  Make sure you have saved your recovery phrase somewhere safe
                  in the last step as after transferring your assets, they will
                  be in your new wallet. If you forget your password and loose
                  your recovery phrase, you will lose access to your wallet and
                  your funds.
                </p>

                <p>
                  Go ahead and enter your wallet address (public key) below. You
                  can get this by clicking the &quot;Deposit&quot; button in
                  your wallet, choosing &quot;Solana&quot; and then copying the
                  address.
                </p>

                {walletData ? (
                  <>
                    <form onSubmit={onSubmit}>
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="message" required>
                            Address
                          </Label>
                          <Input
                            {...register("address")}
                            type="text"
                            placeholder="Address of your non-custodial wallet"
                          />
                          {errors.address && (
                            <span className="text-red-500">
                              {errors.address.message}
                            </span>
                          )}
                        </div>

                        <Button type="submit" isLoading={isTransfering}>
                          Transfer assets
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <p>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    <span>
                      Fetching your wallet data. This might take a few seconds.
                    </span>
                  </p>
                )}
              </>
            )}

            {step === WalletSetupSteps.Done && (
              <div className="flex flex-col gap-6">
                <h2>Done</h2>

                <p>
                  You have successfully set up your non-custodial wallet and
                  transferred your funds. You can now go ahead and start using
                  your non-custodial wallet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <Button onClick={login}>Login</Button>
        )
      ) : (
        <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
      )}
    </div>
  );
};

export default NonCustodialOnboardingPage;
