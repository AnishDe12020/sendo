"use client";

import Link from "next/link";

import { siteConfig } from "@/config/site";

import { Icons } from "@/components/icons";
import { ConnectWallet } from "@/components/shared/ConnectWallet";
import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/utils/tailwind";

import { DesktopNav } from "./Desktop";
import { MobileNav } from "./Mobile";
import useWeb3Auth from "@/hooks/useWeb3Auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import Avvvatars from "avvvatars-react";

export const Header = () => {
  const { address, login, logout, web3auth, isLoadingAddress } = useWeb3Auth();

  return (
    <header className="sticky top-0 z-40 justify-between w-full border-b shadow-sm supports-backdrop-blur:bg-background/60 bg-background/75 backdrop-blur">
      <div className="container flex items-center h-14">
        <DesktopNav />
        <MobileNav />
        <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: "ghost",
                    }),
                    "w-9 px-0"
                  )}
                >
                  <Icons.gitHub className="w-5 h-5" />
                  <span className="sr-only">GitHub</span>
                </div>
              </Link>
            </div>

            <ConnectWallet />

            {web3auth && !isLoadingAddress ? (
              address ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background">
                      <Avvvatars style="shape" value={address} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive"
                    >
                      <LogOutIcon />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  className="text-black bg-white hover:bg-gray-200"
                >
                  <Icons.google className="w-8 h-8 mr-1" />
                  <span>Login</span>
                </Button>
              )
            ) : (
              <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
