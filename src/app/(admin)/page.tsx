"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useWeb3Auth from "@/hooks/useWeb3Auth";

const Home = () => {
  const router = useRouter();

  const { web3auth, login, getAccounts, provider, address } = useWeb3Auth();

  return (
    <div className="flex flex-col items-center w-full mt-8 space-y-6">
      <h1 className="mb-16 text-5xl font-bold">Onsol Demo</h1>

      <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>

      {web3auth ? (
        address ? (
          <p>{address}</p>
        ) : (
          <Button onClick={login}>Connect</Button>
        )
      ) : (
        <p>Loading...</p>
      )}

      {provider && (
        <Button
          onClick={async () => {
            const accounts = await getAccounts();
            console.log(accounts);
          }}
        >
          Get accounts
        </Button>
      )}
    </div>
  );
};

export default Home;
