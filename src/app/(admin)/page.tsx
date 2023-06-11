"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CandyIcon,
  CoinsIcon,
  FuelIcon,
  GiftIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

const Home = () => {
  return (
    <section className="relative flex flex-col items-center w-full text-center">
      <svg
        viewBox="0 0 1024 1024"
        className="absolute left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] -top-64"
        aria-hidden="true"
      >
        <circle
          cx={512}
          cy={128}
          r={512}
          fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
          fillOpacity="0.5"
        />
        <defs>
          <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
            <stop stopColor="#413fc9" />
            <stop offset={1} stopColor="#320f7c" />
          </radialGradient>
        </defs>
      </svg>

      <div className="flex flex-col items-center max-w-3xl mt-16">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Universal crypto gifting
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 dark:text-gray-400">
          Send crypto and NFTs to anyone even if they don&apos;t have a crypto
          wallet or you don&apos;t know their wallet address.
        </p>
        <div className="flex flex-col mb-8 space-y-4 lg:mb-16 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({
                size: "lg",
                className: "text-lg font-semibold cursor-pointer",
              })
            )}
          >
            <span>Get started</span>
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-32 sm:grid-cols-2 w-fit">
          <div
            className="flex flex-col border-[1px] border-[#2A2427] rounded-xl bg-[#121212B2] w-64 h-56 items-center justify-center p-4"
            style={{ backdropFilter: "blur(150px)" }}
          >
            <FuelIcon className="w-8 h-8 mx-auto text-white" />

            <div className="flex flex-col items-center justify-center gap-2 mt-4">
              <h3 className="text-lg font-semibold text-white">
                Gasless transactions
              </h3>
              <p className="text-sm font-normal text-white">
                Users don&apos;t need to pay gas fees to receive crypto or NFTs.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div
              className="flex flex-col border-[1px] border-[#2A2427] rounded-xl bg-[#121212B2] items-center justify-center w-64 h-56 p-4"
              style={{ backdropFilter: "blur(150px)" }}
            >
              <ZapIcon className="w-8 h-8 mx-auto text-white" />

              <div className="flex flex-col items-center justify-center gap-2 mt-4">
                <h3 className="text-lg font-semibold text-white">
                  Effortless wallet creation
                </h3>
                <p className="text-sm font-normal text-white">
                  Users don&apos;t need to have a crypto wallet to receive
                  crypto or NFTs. They can create a semi-custodial wallet with
                  web3auth and move to a non-custodial wallet later.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div
              className="flex flex-col border-[1px] border-[#2A2427] rounded-xl bg-[#121212B2] items-center justify-center w-64 h-56 p-4"
              style={{ backdropFilter: "blur(150px)" }}
            >
              <CoinsIcon className="w-8 h-8 mx-auto text-white" />

              <div className="flex flex-col items-center justify-center gap-2 mt-4">
                <h3 className="text-lg font-semibold text-white">
                  Multi-asset support
                </h3>
                <p className="text-sm font-normal text-white">
                  We support SOL and many popular SPL tokens like USDC, BONK,
                  etc. We also support regular as well as compressed NFTs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div
              className="flex flex-col border-[1px] border-[#2A2427] rounded-xl bg-[#121212B2] items-center justify-center w-64 h-56 p-4"
              style={{ backdropFilter: "blur(150px)" }}
            >
              <CandyIcon className="w-8 h-8 mx-auto text-white" />

              <div className="flex flex-col items-center justify-center gap-2 mt-4">
                <h3 className="text-lg font-semibold text-white">
                  Compressed NFT Dispenser
                </h3>
                <p className="text-sm font-normal text-white">
                  Create a link/qr code which can be scanned by anyone to
                  receive a compressed NFT. We limit it to 1 per user to prevent
                  spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
