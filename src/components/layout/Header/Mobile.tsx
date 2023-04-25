"use client";

import { SidebarOpen } from "lucide-react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { siteConfig } from "@/config/site";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { cn } from "@/utils/tailwind";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 mr-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <SidebarOpen className="w-6 h-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent size="xl" position="left" className="pr-0">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <Icons.logo className="w-4 h-4 mr-2" />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>
      </SheetContent>
    </Sheet>
  );
};

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const MobileLink = ({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) => {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  );
};
