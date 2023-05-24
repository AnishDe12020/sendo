import { SolanaProvider } from "@/components/wrappers/SolanaProvider";
import { ThemeProvider } from "@/components/wrappers/ThemeProvider";
import NextTopLoader from "nextjs-toploader";

import "@/styles/globals.css";
import SessionProviderWrapper from "@/components/wrappers/SessionProvider";
import Toaster from "@/components/wrappers/SonnerToaster";
import Web3AuthProvider from "@/components/wrappers/Web3AuthProvider";
import ReactQueryProvider from "@/components/wrappers/ReactQueryProvider";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-background antialiase">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SolanaProvider>
            <SessionProviderWrapper>
              <Web3AuthProvider>
                <ReactQueryProvider>
                  <NextTopLoader
                    color="#ffffff"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                  />
                  <Toaster />
                  {children}
                </ReactQueryProvider>
              </Web3AuthProvider>
            </SessionProviderWrapper>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
