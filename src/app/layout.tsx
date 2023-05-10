import { SolanaProvider } from "@/components/wrappers/SolanaProvider";
import { ThemeProvider } from "@/components/wrappers/ThemeProvider";

import "@/styles/globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProvider";
import Toaster from "@/components/wrappers/SonnerToaster";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-background antialiase">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SolanaProvider>
            <SessionProviderWrapper>
              <Toaster />
              {children}
              {/* <Header />
                <Toaster />
                <main className="container flex flex-col min-h-full mt-8 mb-12 h-fit">
                  {children}
                </main>
                <Footer /> */}
            </SessionProviderWrapper>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
