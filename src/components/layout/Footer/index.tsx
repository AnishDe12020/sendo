import { siteConfig } from "@/config/site";

import { Icons } from "@/components/icons";

import ThemeToggle from "./ThemeToggle";

export const Footer = () => {
  return (
    <footer className="bottom-0 flex flex-row justify-between w-full py-4 mt-8 border-t ">
      <div className="container flex flex-row justify-between w-full">
        <div className="flex flex-row space-x-2">
          <Icons.logo className="hidden w-6 h-6 md:inline-block" />
          <p className="text-sm leading-loose text-center text-muted-foreground md:text-left">
            Copyright &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>

        <ThemeToggle />
      </div>
    </footer>
  );
};
