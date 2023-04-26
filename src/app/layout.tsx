import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SolanaProvider } from "@/components/wrappers/SolanaProvider";
import { ThemeProvider } from "@/components/wrappers/ThemeProvider";

import "@/styles/globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProvider";
import Toaster from "@/components/wrappers/SonnerToaster";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SolanaProvider>
            <SessionProviderWrapper>
              <div className="flex flex-col w-screen h-screen">
                <Header />
                <Toaster />
                <main className="container flex flex-col h-full mt-8">
                  {children}
                </main>
                <Footer />
              </div>
            </SessionProviderWrapper>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
